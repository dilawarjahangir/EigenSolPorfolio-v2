import { revalidatePath } from "next/cache";
import type { BlogCommentModerationAction } from "@/contracts/blog-comments";
import { readRequestBody, RequestBodyTooLargeError } from "@/lib/request-body";
import {
  applyBlogCommentModeration,
  previewBlogCommentModeration,
} from "@/services/blog-comments/BlogCommentService";

export const runtime = "nodejs";
export const maxDuration = 15;

const maximumBodyLength = 1_024;
const invalidLinkMessage = "This moderation link is invalid or has expired.";
const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} satisfies HeadersInit;

type ModerationRequestAction = "preview" | BlogCommentModerationAction;

type ModerationRequest = Readonly<{
  action: ModerationRequestAction;
  token: string;
}>;

function jsonResponse(body: object, status = 200) {
  return Response.json(body, { status, headers: responseHeaders });
}

function invalidLinkResponse(status = 404) {
  return jsonResponse({ ok: false, message: invalidLinkMessage }, status);
}

function requestOriginIsAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHostname = new URL(origin).hostname.toLowerCase();
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const requestHostname = forwardedHost.split(",")[0].trim().split(":")[0].toLowerCase();
    const canonicalHosts = new Set(["eigensol.com", "www.eigensol.com"]);

    return (
      originHostname === requestHostname ||
      (canonicalHosts.has(originHostname) && canonicalHosts.has(requestHostname))
    );
  } catch {
    return false;
  }
}

function parseModerationRequest(value: unknown): ModerationRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const input = value as Record<string, unknown>;
  const action = input.action;
  const token = input.token;

  if (
    (action !== "preview" && action !== "approved" && action !== "rejected") ||
    typeof token !== "string"
  ) {
    return null;
  }

  return { action, token };
}

export async function POST(request: Request) {
  if (!requestOriginIsAllowed(request)) {
    return jsonResponse({ ok: false, message: "This moderation request was not allowed." }, 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return invalidLinkResponse(415);
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBodyLength) {
    return invalidLinkResponse(413);
  }

  try {
    const body = await readRequestBody(request, maximumBodyLength);

    const moderationRequest = parseModerationRequest(JSON.parse(body) as unknown);
    if (!moderationRequest) return invalidLinkResponse(400);

    if (moderationRequest.action === "preview") {
      const preview = await previewBlogCommentModeration(moderationRequest.token);
      if (!preview) return invalidLinkResponse();

      return jsonResponse({ ok: true, preview });
    }

    const result = await applyBlogCommentModeration(
      moderationRequest.token,
      moderationRequest.action,
    );
    if (!result) return invalidLinkResponse();

    revalidatePath(`/blogs/${result.postSlug}`);
    return jsonResponse({ ok: true, action: result.action, postSlug: result.postSlug });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return invalidLinkResponse(413);
    if (error instanceof SyntaxError) return invalidLinkResponse(400);

    console.error("Blog comment moderation request failed");
    return jsonResponse(
      { ok: false, message: "We couldn't update this comment right now. Please try again." },
      503,
    );
  }
}
