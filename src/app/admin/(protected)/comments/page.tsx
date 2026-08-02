import { Check, ChevronRight, MessageSquareText, Search, X } from "lucide-react";
import Link from "next/link";
import type {
  BlogCommentNotificationStatus,
  BlogCommentStatus,
} from "@/contracts/blog-comments";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import styles from "@/components/admin/AdminUi.module.css";
import {
  getAdminBlogCommentCounts,
  getAdminBlogComments,
} from "@/services/blog-comments/BlogCommentService";
import { listAdminBlogPostOptions } from "@/services/blog-posts/BlogPostService";
import { requireOwner } from "@/services/auth/AdminAuthService";
import { bulkModerateBlogCommentsAction } from "./actions";

type CommentAdminPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const statuses = ["pending", "approved", "rejected", "removed", "expired"] as const;
const notificationStatuses = ["pending", "sent", "failed"] as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validStatus(value: string | undefined): BlogCommentStatus | undefined {
  return statuses.includes(value as BlogCommentStatus) ? (value as BlogCommentStatus) : undefined;
}

function validNotificationStatus(value: string | undefined): BlogCommentNotificationStatus | undefined {
  return notificationStatuses.includes(value as BlogCommentNotificationStatus)
    ? (value as BlogCommentNotificationStatus)
    : undefined;
}

function validPostId(value: string | undefined) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function statusTone(status: BlogCommentStatus) {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected" || status === "removed" || status === "expired") return "danger";
  return "neutral";
}

function noticeText(value: string | undefined) {
  if (!value) return null;
  if (value === "conflict") return "This comment was already moderated elsewhere. The queue has been refreshed.";
  if (value === "not-found") return "That comment no longer exists.";
  if (value === "invalid-request") return "The moderation request was invalid.";
  if (value.startsWith("bulk-")) {
    const [, action, applied = "0", conflicts = "0"] = value.split("-");
    return `${applied} comments were ${action}; ${conflicts} were already changed or unavailable.`;
  }
  return null;
}

function queryHref(
  values: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...values, ...updates })) {
    if (value) query.set(key, value);
  }
  const serialized = query.toString();
  return serialized ? `/admin/comments?${serialized}` : "/admin/comments";
}

export default async function CommentAdminPage({ searchParams }: CommentAdminPageProps) {
  await requireOwner();
  const params = await searchParams;
  const status = validStatus(firstValue(params.status));
  const notificationStatus = validNotificationStatus(firstValue(params.notification));
  const postId = validPostId(firstValue(params.postId));
  const search = firstValue(params.search)?.trim().slice(0, 100) || undefined;
  const cursor = firstValue(params.cursor);
  const notice = noticeText(firstValue(params.notice));
  const query = { status, postId, notificationStatus, search, cursor, limit: 25 };
  const [comments, counts, postOptions] = await Promise.all([
    getAdminBlogComments(query),
    getAdminBlogCommentCounts(postId),
    listAdminBlogPostOptions(),
  ]);
  const currentQuery = {
    status,
    postId,
    notification: notificationStatus,
    search,
  };
  const returnTo = queryHref(currentQuery, {});

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderCopy}>
          <p className={styles.eyebrow}>Community moderation</p>
          <h1 className={styles.title}>Blog comments</h1>
          <p className={styles.description}>
            Review submissions, protect commenter privacy, and keep public discussions useful.
          </p>
        </div>
      </header>

      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}

      <section className={styles.statsGrid} aria-label="Comment status totals">
        {statuses.map((item) => (
          <Link className={styles.statCard} href={queryHref(currentQuery, { status: item })} key={item}>
            <span>{item}</span>
            <strong>{counts[item]}</strong>
          </Link>
        ))}
        <Link className={styles.statCard} href="/admin/comments">
          <span>All comments</span>
          <strong>{counts.total}</strong>
        </Link>
      </section>

      <form className={styles.filterBar} method="get" action="/admin/comments">
        <label className={styles.field}>
          <span>Search comments</span>
          <input className={styles.input} name="search" defaultValue={search} maxLength={100} />
        </label>
        <label className={styles.fieldCompact}>
          <span>Article</span>
          <select className={styles.select} name="postId" defaultValue={postId ?? ""}>
            <option value="">All articles</option>
            {postOptions.map((post) => (
              <option value={post.id} key={post.id}>{post.title}</option>
            ))}
          </select>
        </label>
        <label className={styles.fieldCompact}>
          <span>Status</span>
          <select className={styles.select} name="status" defaultValue={status ?? ""}>
            <option value="">All statuses</option>
            {statuses.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <label className={styles.fieldCompact}>
          <span>Email notice</span>
          <select className={styles.select} name="notification" defaultValue={notificationStatus ?? ""}>
            <option value="">Any delivery state</option>
            {notificationStatuses.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <button className={styles.buttonSecondary} type="submit">
          <Search aria-hidden="true" />
          Filter
        </button>
      </form>

      <form action={bulkModerateBlogCommentsAction} className={styles.tablePanel}>
        <input type="hidden" name="returnTo" value={returnTo} />
        {comments.items.length ? (
          <>
            <div className={styles.panel}>
              <div className={styles.inlineActions}>
                <AdminConfirmButton
                  name="action"
                  value="approved"
                  tone="secondary"
                  pendingLabel="Approving…"
                  confirmation="Approve every selected pending comment?"
                >
                  <Check aria-hidden="true" />
                  Approve selected
                </AdminConfirmButton>
                <AdminConfirmButton
                  name="action"
                  value="rejected"
                  pendingLabel="Rejecting…"
                  confirmation="Reject and permanently erase every selected comment? This cannot be undone."
                >
                  <X aria-hidden="true" />
                  Reject selected
                </AdminConfirmButton>
              </div>
            </div>
            <div className={styles.tableScroller}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">Select</span></th>
                    <th scope="col">Comment</th>
                    <th scope="col">Article</th>
                    <th scope="col">Status</th>
                    <th scope="col">Notification</th>
                    <th scope="col">Submitted</th>
                    <th scope="col"><span className="sr-only">Review</span></th>
                  </tr>
                </thead>
                <tbody>
                  {comments.items.map((comment) => (
                    <tr key={comment.id}>
                      <td>
                        {comment.status === "pending" ? (
                          <input
                            type="checkbox"
                            name="commentId"
                            value={comment.id}
                            aria-label={`Select comment from ${comment.authorName ?? "anonymous commenter"}`}
                          />
                        ) : null}
                      </td>
                      <td>
                        <div className={styles.primaryCell}>
                          <strong>{comment.authorName ?? "Redacted commenter"}</strong>
                          <span>{comment.bodyPreview ?? "Content permanently removed"}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.primaryCell}>
                          <strong>{comment.postTitle}</strong>
                          <span>/{comment.postSlug}</span>
                        </div>
                      </td>
                      <td><span className={styles.badge} data-tone={statusTone(comment.status)}>{comment.status}</span></td>
                      <td>
                        <span
                          className={styles.badge}
                          data-tone={comment.notificationStatus === "failed" ? "danger" : comment.notificationStatus === "sent" ? "success" : "warning"}
                        >
                          {comment.notificationStatus}
                        </span>
                      </td>
                      <td>{formatDate(comment.createdAt)}</td>
                      <td>
                        <Link className={styles.buttonGhost} href={`/admin/comments/${comment.id}`}>
                          Review <ChevronRight aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <span>Showing up to 25 comments</span>
              <div>
                {comments.nextCursor ? (
                  <Link
                    className={styles.buttonSecondary}
                    href={queryHref(currentQuery, { cursor: comments.nextCursor })}
                  >
                    Next page <ChevronRight aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <MessageSquareText aria-hidden="true" />
            <h2>No comments match these filters</h2>
            <p>Try a different status or clear the search field.</p>
            <Link className={styles.buttonSecondary} href="/admin/comments">Clear filters</Link>
          </div>
        )}
      </form>
    </div>
  );
}
