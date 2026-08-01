import { projectBudgets, projectServices, type WebsiteFormSubmission } from "@/lib/form-submission";
import { sendProjectInquiryEmail } from "@/lib/form-mail";
import { readRequestBody, RequestBodyTooLargeError } from "@/lib/request-body";
import {
  BlogCommentRateLimitError,
  BlogCommentValidationError,
  submitBlogComment,
} from "@/services/blog-comments/BlogCommentService";

export const runtime = "nodejs";
export const maxDuration = 30;

const maximumBodyLength = 16_384;
const rateLimitWindow = 10 * 60 * 1_000;
const maximumSubmissionsPerWindow = 5;
const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = typeof globalThis & {
  eigensolFormRateLimits?: Map<string, RateLimitEntry>;
};

const rateLimitStore = globalThis as RateLimitStore;
const rateLimits = rateLimitStore.eigensolFormRateLimits ?? new Map<string, RateLimitEntry>();
rateLimitStore.eigensolFormRateLimits = rateLimits;

class FormValidationError extends Error {}

function jsonResponse(body: object, status = 200, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function readText(
  input: Record<string, unknown>,
  field: string,
  options: { required?: boolean; minimum?: number; maximum: number; multiline?: boolean },
) {
  const value = input[field];

  if (typeof value !== "string") {
    if (options.required) throw new FormValidationError(`Please provide ${field}.`);
    return "";
  }

  const normalized = value.trim();

  if (options.required && normalized.length < (options.minimum ?? 1)) {
    throw new FormValidationError(`Please provide ${field}.`);
  }

  if (normalized.length > options.maximum) {
    throw new FormValidationError(`${field} is too long.`);
  }

  if (controlCharacters.test(normalized) || (!options.multiline && /[\r\n]/.test(normalized))) {
    throw new FormValidationError(`${field} contains unsupported characters.`);
  }

  return normalized;
}

function readEmail(input: Record<string, unknown>) {
  const email = readText(input, "email", { required: true, maximum: 254 }).toLowerCase();

  if (!emailPattern.test(email)) {
    throw new FormValidationError("Please provide a valid email address.");
  }

  return email;
}

function readWebsite(input: Record<string, unknown>) {
  const website = readText(input, "website", { maximum: 500 });
  if (!website) return "";

  try {
    const parsed = new URL(website);
    if (
      (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
      parsed.username ||
      parsed.password
    ) {
      throw new Error();
    }

    const normalized = parsed.toString();
    if (normalized.length > 500) throw new Error();
    return normalized;
  } catch {
    throw new FormValidationError("Please provide a valid website URL.");
  }
}

function validateSubmission(input: unknown): WebsiteFormSubmission {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new FormValidationError("The submitted form is invalid.");
  }

  const values = input as Record<string, unknown>;
  const kind = values.kind;
  const companyUrl = readText(values, "companyUrl", { maximum: 500 });
  const name = readText(values, "name", { required: true, minimum: 2, maximum: 100 });
  const email = readEmail(values);

  if (kind === "project-inquiry") {
    const service = readText(values, "service", { required: true, maximum: 100 });
    const budget = readText(values, "budget", { maximum: 100 });

    if (!projectServices.includes(service as (typeof projectServices)[number])) {
      throw new FormValidationError("Please select a valid service.");
    }

    if (budget && !projectBudgets.includes(budget as (typeof projectBudgets)[number])) {
      throw new FormValidationError("Please select a valid project budget.");
    }

    return {
      kind,
      companyUrl,
      name,
      email,
      company: readText(values, "company", { maximum: 160 }),
      phone: readText(values, "phone", { maximum: 50 }),
      service,
      budget,
      message: readText(values, "message", {
        required: true,
        minimum: 20,
        maximum: 5_000,
        multiline: true,
      }),
    };
  }

  if (kind === "blog-comment") {
    const postSlug = readText(values, "postSlug", { required: true, maximum: 160 });

    if (!slugPattern.test(postSlug)) {
      throw new FormValidationError("The selected article is invalid.");
    }

    return {
      kind,
      companyUrl,
      name,
      email,
      website: readWebsite(values),
      comment: readText(values, "comment", {
        required: true,
        minimum: 10,
        maximum: 3_000,
        multiline: true,
      }),
      postSlug,
    };
  }

  throw new FormValidationError("The submitted form type is invalid.");
}

function requestOriginIsAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHostname = new URL(origin).hostname.toLowerCase();
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const requestHostname = forwardedHost.split(":")[0].toLowerCase();
    const canonicalHosts = new Set(["eigensol.com", "www.eigensol.com"]);

    return (
      originHostname === requestHostname ||
      (canonicalHosts.has(originHostname) && canonicalHosts.has(requestHostname))
    );
  } catch {
    return false;
  }
}

function requestIdentifier(request: Request) {
  const forwarded =
    request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  return forwarded.split(",")[0].trim().slice(0, 64) || "unknown";
}

function rateLimit(request: Request) {
  const now = Date.now();

  if (rateLimits.size > 1_000) {
    for (const [identifier, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(identifier);
    }
  }

  const identifier = requestIdentifier(request);
  const current = rateLimits.get(identifier);

  if (!current || current.resetAt <= now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + rateLimitWindow });
    return null;
  }

  if (current.count >= maximumSubmissionsPerWindow) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1_000));
  }

  current.count += 1;
  return null;
}

function safeErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return "unknown";
  return String(error.code).slice(0, 80);
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  if (!requestOriginIsAllowed(request)) {
    return jsonResponse({ ok: false, message: "This form request was not allowed." }, 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse({ ok: false, message: "This form format is not supported." }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBodyLength) {
    return jsonResponse({ ok: false, message: "This form submission is too large." }, 413);
  }

  const retryAfter = rateLimit(request);
  if (retryAfter !== null) {
    return jsonResponse(
      { ok: false, message: "Too many messages were sent. Please try again shortly." },
      429,
      { "Retry-After": String(retryAfter) },
    );
  }

  try {
    const body = await readRequestBody(request, maximumBodyLength);
    let parsed: unknown;

    try {
      parsed = JSON.parse(body) as unknown;
    } catch {
      throw new FormValidationError("The submitted form is invalid.");
    }

    const submission = validateSubmission(parsed);

    if (submission.companyUrl) {
      console.warn("Website form spam trap triggered", {
        requestId,
        kind: submission.kind,
      });
      return jsonResponse({ ok: true });
    }

    if (submission.kind === "blog-comment") {
      await submitBlogComment(submission, requestIdentifier(request));
      return jsonResponse({ ok: true }, 201);
    }

    await sendProjectInquiryEmail(submission);
    return jsonResponse({ ok: true });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return jsonResponse({ ok: false, message: "This form submission is too large." }, 413);
    }

    if (error instanceof FormValidationError) {
      return jsonResponse({ ok: false, message: error.message }, 400);
    }

    if (error instanceof BlogCommentValidationError) {
      return jsonResponse({ ok: false, message: error.message }, 400);
    }

    if (error instanceof BlogCommentRateLimitError) {
      return jsonResponse(
        { ok: false, message: "Too many comments were submitted. Please try again shortly." },
        429,
        { "Retry-After": String(error.retryAfterSeconds) },
      );
    }

    console.error(`Website form delivery failed (${requestId})`, {
      code: safeErrorCode(error),
    });
    return jsonResponse(
      { ok: false, message: "We couldn't deliver your message right now. Please try again shortly." },
      503,
    );
  }
}
