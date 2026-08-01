"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type {
  BlogCommentModerationAction,
  BlogCommentModerationPreview,
} from "@/contracts/blog-comments";
import styles from "./BlogCommentModeration.module.css";

const invalidLinkMessage = "This moderation link is invalid or has expired.";
const unavailableMessage = "We couldn't check this moderation link right now. Please try again.";

type ModerationRequestAction = "preview" | BlogCommentModerationAction;

type ModerationState =
  | Readonly<{ phase: "loading" }>
  | Readonly<{ phase: "ready" | "submitting"; preview: BlogCommentModerationPreview }>
  | Readonly<{
      phase: "completed";
      action: BlogCommentModerationAction;
      postSlug: string;
    }>
  | Readonly<{ phase: "error"; message: string }>;

class ModerationRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parsePreview(value: unknown): BlogCommentModerationPreview | null {
  if (!isRecord(value)) return null;

  const websiteUrl = value.websiteUrl;
  if (
    typeof value.postSlug !== "string" ||
    typeof value.postTitle !== "string" ||
    typeof value.authorName !== "string" ||
    (websiteUrl !== null && typeof websiteUrl !== "string") ||
    typeof value.body !== "string" ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  return {
    postSlug: value.postSlug,
    postTitle: value.postTitle,
    authorName: value.authorName,
    websiteUrl,
    body: value.body,
    createdAt: value.createdAt,
  };
}

async function requestModeration(
  action: ModerationRequestAction,
  token: string,
  signal?: AbortSignal,
) {
  const response = await fetch("/api/blog-comments/moderate", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, token }),
    cache: "no-store",
    credentials: "same-origin",
    referrerPolicy: "no-referrer",
    signal,
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ModerationRequestError(unavailableMessage, response.status);
  }

  if (!response.ok || !isRecord(payload) || payload.ok !== true) {
    const message = isRecord(payload) && typeof payload.message === "string"
      ? payload.message
      : unavailableMessage;
    throw new ModerationRequestError(message, response.status);
  }

  return payload;
}

function moderationErrorMessage(error: unknown) {
  return error instanceof ModerationRequestError ? error.message : unavailableMessage;
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Submission date unavailable";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function websiteLabel(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function safeWebsiteUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export default function BlogCommentModeration() {
  const [state, setState] = useState<ModerationState>({ phase: "loading" });
  const [actionError, setActionError] = useState("");
  const tokenRef = useRef("");
  const submittingRef = useRef(false);

  useLayoutEffect(() => {
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get("token")?.trim();
    const token = tokenRef.current || fragmentToken || "";
    tokenRef.current = token;

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    if (!token) {
      setState({ phase: "error", message: invalidLinkMessage });
      return;
    }

    const controller = new AbortController();
    let active = true;

    void requestModeration("preview", token, controller.signal)
      .then((payload) => {
        if (!active) return;

        const preview = parsePreview(payload.preview);
        setState(
          preview
            ? { phase: "ready", preview }
            : { phase: "error", message: unavailableMessage },
        );
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        setState({ phase: "error", message: moderationErrorMessage(error) });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  async function moderate(action: BlogCommentModerationAction) {
    if (state.phase !== "ready" || submittingRef.current) return;

    const preview = state.preview;
    submittingRef.current = true;
    setActionError("");
    setState({ phase: "submitting", preview });

    try {
      const payload = await requestModeration(action, tokenRef.current);
      if (payload.action !== action || typeof payload.postSlug !== "string") {
        throw new ModerationRequestError(unavailableMessage, 502);
      }

      tokenRef.current = "";
      setState({ phase: "completed", action, postSlug: payload.postSlug });
    } catch (error) {
      if (error instanceof ModerationRequestError && error.status >= 400 && error.status < 500) {
        setState({ phase: "error", message: error.message });
      } else {
        setActionError(moderationErrorMessage(error));
        setState({ phase: "ready", preview });
      }
    } finally {
      submittingRef.current = false;
    }
  }

  const previewWebsiteUrl =
    state.phase === "ready" || state.phase === "submitting"
      ? safeWebsiteUrl(state.preview.websiteUrl)
      : null;

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="moderation-title">
        <Link className={styles.brand} href="/" aria-label="EigenSol home">
          EigenSol
        </Link>
        <p className={styles.eyebrow}>Comment moderation</p>
        <h1 id="moderation-title">Review a blog comment</h1>

        {state.phase === "loading" && (
          <div className={styles.status} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <p>Checking the moderation link…</p>
          </div>
        )}

        {state.phase === "error" && (
          <div className={`${styles.notice} ${styles.errorNotice}`} role="alert">
            <h2>Unable to open this comment</h2>
            <p>{state.message}</p>
            <Link href="/blogs">Return to the blog</Link>
          </div>
        )}

        {(state.phase === "ready" || state.phase === "submitting") && (
          <div className={styles.review} aria-busy={state.phase === "submitting"}>
            <dl className={styles.details}>
              <div>
                <dt>Article</dt>
                <dd>{state.preview.postTitle}</dd>
              </div>
              <div>
                <dt>Author</dt>
                <dd>{state.preview.authorName}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>
                  <time dateTime={state.preview.createdAt}>
                    {formatSubmittedAt(state.preview.createdAt)}
                  </time>
                </dd>
              </div>
              {previewWebsiteUrl && (
                <div>
                  <dt>Website</dt>
                  <dd>
                    <a
                      href={previewWebsiteUrl}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      referrerPolicy="no-referrer"
                    >
                      {websiteLabel(previewWebsiteUrl)}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <div className={styles.comment}>
              <h2>Comment</h2>
              <blockquote>{state.preview.body}</blockquote>
            </div>

            {actionError && (
              <p className={styles.actionError} role="alert">
                {actionError}
              </p>
            )}

            <div className={styles.actions}>
              <button
                className={styles.approveButton}
                type="button"
                disabled={state.phase === "submitting"}
                onClick={() => void moderate("approved")}
              >
                {state.phase === "submitting" ? "Updating…" : "Approve comment"}
              </button>
              <button
                className={styles.rejectButton}
                type="button"
                disabled={state.phase === "submitting"}
                onClick={() => void moderate("rejected")}
              >
                Reject comment
              </button>
            </div>
          </div>
        )}

        {state.phase === "completed" && (
          <div className={`${styles.notice} ${styles.successNotice}`} role="status">
            <h2>Comment {state.action === "approved" ? "approved" : "rejected"}</h2>
            <p>
              {state.action === "approved"
                ? "The comment is now published on the article."
                : "The comment was rejected and its submitted details were removed."}
            </p>
            <Link href={`/blogs/${state.postSlug}`}>View the article</Link>
          </div>
        )}
      </section>
    </main>
  );
}
