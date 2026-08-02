import { ArrowLeft, ExternalLink, Mail, RefreshCw, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import styles from "@/components/admin/AdminUi.module.css";
import { getAdminBlogComment } from "@/services/blog-comments/BlogCommentService";
import { requireOwner } from "@/services/auth/AdminAuthService";
import {
  moderateBlogCommentAction,
  retryBlogCommentNotificationAction,
} from "../actions";
import detailStyles from "./CommentDetail.module.css";

type CommentDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : dateFormatter.format(date);
}

function noticeText(value: string | undefined) {
  if (value === "approved") return "The comment is approved and visible publicly.";
  if (value === "rejected") return "The comment was rejected and its personal data was permanently erased.";
  if (value === "removed") return "The approved comment was removed and permanently redacted.";
  if (value === "notification-sent") return "A fresh moderation email was sent and the previous token was invalidated.";
  if (value === "notification-failed") return "The notification could not be delivered. The comment remains safely queued.";
  if (value === "conflict") return "Another moderation request won the race. This page now shows the latest state.";
  return null;
}

function safeWebsite(value: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && !parsed.username && !parsed.password
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

export default async function CommentDetailPage({ params, searchParams }: CommentDetailPageProps) {
  await requireOwner();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const comment = await getAdminBlogComment(id);
  if (!comment) notFound();
  const notice = noticeText((await searchParams).notice);
  const returnTo = `/admin/comments/${comment.id}`;
  const website = safeWebsite(comment.websiteUrl);

  return (
    <div className={styles.page}>
      <Link className={styles.buttonGhost} href="/admin/comments">
        <ArrowLeft aria-hidden="true" />
        Back to comments
      </Link>

      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderCopy}>
          <p className={styles.eyebrow}>Comment review</p>
          <h1 className={styles.title}>{comment.authorName ?? "Redacted comment"}</h1>
          <p className={styles.description}>
            Submitted for <Link href={`/blogs/${comment.postSlug}`} target="_blank">{comment.postTitle}</Link>
          </p>
        </div>
        <span className={styles.badge} data-tone={comment.status === "approved" ? "success" : comment.status === "pending" ? "warning" : "danger"}>
          {comment.status}
        </span>
      </header>

      {notice ? <p className={notice.includes("could not") ? styles.errorNotice : styles.successNotice} role="status">{notice}</p> : null}

      <div className={detailStyles.grid}>
        <section className={styles.panel} aria-labelledby="comment-content-heading">
          <div className={styles.panelHeader}>
            <h2 id="comment-content-heading">Submitted content</h2>
          </div>
          {comment.body ? (
            <p className={detailStyles.commentBody}>{comment.body}</p>
          ) : (
            <div className={detailStyles.redacted}>
              <ShieldAlert aria-hidden="true" />
              <p>This content was permanently redacted and cannot be restored.</p>
            </div>
          )}

          <dl className={detailStyles.details}>
            <div><dt>Email</dt><dd>{comment.authorEmail ? <a href={`mailto:${comment.authorEmail}`}>{comment.authorEmail}</a> : "Removed"}</dd></div>
            <div><dt>Website</dt><dd>{website ? <a href={website} target="_blank" rel="noreferrer noopener nofollow">Open website <ExternalLink aria-hidden="true" /></a> : "Not provided or removed"}</dd></div>
            <div><dt>Submitted</dt><dd>{formatDate(comment.createdAt)}</dd></div>
            <div><dt>Moderated</dt><dd>{formatDate(comment.moderatedAt)}</dd></div>
            <div><dt>Pending expiry</dt><dd>{formatDate(comment.expiresAt)}</dd></div>
          </dl>

          <div className={styles.inlineActions}>
            {comment.status === "pending" ? (
              <>
                <form action={moderateBlogCommentAction}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <AdminConfirmButton
                    name="action"
                    value="approved"
                    tone="primary"
                    pendingLabel="Approving…"
                    confirmation="Approve this comment and publish it on the article? The email address will be removed."
                  >
                    Approve comment
                  </AdminConfirmButton>
                </form>
                <form action={moderateBlogCommentAction}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <AdminConfirmButton
                    name="action"
                    value="rejected"
                    pendingLabel="Rejecting…"
                    confirmation="Reject this comment and permanently erase its author details and body? This cannot be undone."
                  >
                    Reject and erase
                  </AdminConfirmButton>
                </form>
              </>
            ) : null}
            {comment.status === "approved" ? (
              <form action={moderateBlogCommentAction}>
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <AdminConfirmButton
                  name="action"
                  value="removed"
                  pendingLabel="Removing…"
                  confirmation="Remove this public comment and permanently redact its content? This cannot be undone."
                >
                  Remove public comment
                </AdminConfirmButton>
              </form>
            ) : null}
          </div>
        </section>

        <aside className={detailStyles.sidebar}>
          <section className={styles.panel} aria-labelledby="notification-heading">
            <div className={styles.panelHeader}>
              <h2 id="notification-heading">Moderation email</h2>
              <span className={styles.badge} data-tone={comment.notificationStatus === "sent" ? "success" : comment.notificationStatus === "failed" ? "danger" : "warning"}>
                {comment.notificationStatus}
              </span>
            </div>
            <dl className={detailStyles.details}>
              <div><dt>Attempts</dt><dd>{comment.notificationAttemptCount}</dd></div>
              <div><dt>Last attempt</dt><dd>{formatDate(comment.notificationLastAttemptedAt)}</dd></div>
              <div><dt>Sent</dt><dd>{formatDate(comment.notificationSentAt)}</dd></div>
              <div><dt>Token expires</dt><dd>{formatDate(comment.tokenExpiresAt)}</dd></div>
              <div><dt>Token consumed</dt><dd>{formatDate(comment.tokenConsumedAt)}</dd></div>
              {comment.notificationLastErrorCode ? <div><dt>Safe error code</dt><dd><code className={styles.codeValue}>{comment.notificationLastErrorCode}</code></dd></div> : null}
            </dl>
            {comment.status === "pending" && comment.notificationStatus === "failed" ? (
              <form action={retryBlogCommentNotificationAction}>
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <AdminSubmitButton tone="secondary" pendingLabel="Sending…">
                  <RefreshCw aria-hidden="true" />
                  Retry email
                </AdminSubmitButton>
              </form>
            ) : null}
          </section>

          <section className={styles.panel} aria-labelledby="audit-heading">
            <div className={styles.panelHeader}><h2 id="audit-heading">Moderation history</h2></div>
            {comment.moderationEvents.length ? (
              <ol className={detailStyles.timeline}>
                {comment.moderationEvents.map((event) => (
                  <li key={event.id}>
                    <strong>{event.action}</strong>
                    <span>{event.source}{event.actorId ? " · owner" : ""}</span>
                    <time dateTime={event.createdAt}>{formatDate(event.createdAt)}</time>
                  </li>
                ))}
              </ol>
            ) : <p>No moderation action has been recorded yet.</p>}
          </section>

          <Link className={styles.buttonSecondary} href={`/blogs/${comment.postSlug}`} target="_blank">
            View article <ExternalLink aria-hidden="true" />
          </Link>
          {comment.authorEmail ? <span className={detailStyles.privacyNote}><Mail aria-hidden="true" /> Email is visible only while moderation requires it.</span> : null}
        </aside>
      </div>
    </div>
  );
}
