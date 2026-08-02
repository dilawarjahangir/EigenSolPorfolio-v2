import { AlertTriangle, ArrowRight, FilePlus2 } from "lucide-react";
import Link from "next/link";
import ui from "@/components/admin/AdminUi.module.css";
import { requireOwner } from "@/services/auth/AdminAuthService";
import {
  getAdminBlogCommentCounts,
  getAdminBlogComments,
} from "@/services/blog-comments/BlogCommentService";
import { getBlogDashboardSummary } from "@/services/blog-posts/BlogPostService";

const pakistanDate = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

function actionLabel(value: string) {
  return value.replaceAll("-", " ");
}

export default async function AdminDashboardPage() {
  await requireOwner();
  const [posts, comments, pendingComments] = await Promise.all([
    getBlogDashboardSummary(),
    getAdminBlogCommentCounts(),
    getAdminBlogComments({ status: "pending", limit: 5 }),
  ]);

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div className={ui.pageHeaderCopy}>
          <p className={ui.eyebrow}>Owner workspace</p>
          <h1 className={ui.title}>Content dashboard</h1>
          <p className={ui.description}>
            Review publishing activity, scheduled releases, and comments that need attention.
          </p>
        </div>
        <div className={ui.actions}>
          <Link className={ui.button} href="/admin/posts/new">
            <FilePlus2 aria-hidden="true" />
            New post
          </Link>
        </div>
      </header>

      <section className={ui.statsGrid} aria-label="CMS summary">
        <Link className={ui.statCard} href="/admin/posts?status=published">
          <span>Published posts</span>
          <strong>{posts.postCounts.published}</strong>
        </Link>
        <Link className={ui.statCard} href="/admin/posts?status=draft">
          <span>Draft posts</span>
          <strong>{posts.postCounts.draft}</strong>
        </Link>
        <Link className={ui.statCard} href="/admin/comments?status=pending">
          <span>Pending comments</span>
          <strong>{comments.pending}</strong>
        </Link>
        <Link className={ui.statCard} href="/admin/posts">
          <span>Scheduled publications</span>
          <strong>{posts.scheduledPublications}</strong>
        </Link>
        <Link className={ui.statCard} href="/admin/comments?notification=failed">
          <span>Notification failures</span>
          <strong>{comments.notificationFailures}</strong>
        </Link>
      </section>

      {posts.overdueSchedules ? (
        <div className={ui.errorNotice} role="alert">
          <AlertTriangle aria-hidden="true" /> {posts.overdueSchedules} scheduled publication
          {posts.overdueSchedules === 1 ? " is" : "s are"} overdue. Check the systemd publishing timer.
        </div>
      ) : null}

      <div className={ui.dashboardGrid}>
        <section className={ui.panel} aria-labelledby="pending-comments-heading">
          <div className={ui.panelHeader}>
            <h2 id="pending-comments-heading">Newest pending comments</h2>
            <Link href="/admin/comments?status=pending">Review queue</Link>
          </div>
          {pendingComments.items.length ? (
            <ul className={ui.activityList}>
              {pendingComments.items.map((comment) => (
                <li key={comment.id}>
                  <div>
                    <strong>{comment.postTitle}</strong>
                    <span>{comment.authorName ?? "Redacted commenter"} · {comment.bodyPreview ?? "No preview"}</span>
                  </div>
                  <Link className={ui.buttonGhost} href={`/admin/comments/${comment.id}`}>
                    Review <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className={ui.emptyState}>
              <h3>Queue clear</h3>
              <p>There are no pending comments.</p>
            </div>
          )}
        </section>

        <section className={ui.panel} aria-labelledby="recent-activity-heading">
          <div className={ui.panelHeader}>
            <h2 id="recent-activity-heading">Recent publishing activity</h2>
          </div>
          {posts.recentAuditEvents.length ? (
            <ul className={ui.activityList}>
              {posts.recentAuditEvents.slice(0, 10).map((event) => (
                <li key={event.id}>
                  <div>
                    <strong>{event.slug}</strong>
                    <span>{actionLabel(event.action)}</span>
                  </div>
                  <time dateTime={event.createdAt}>{pakistanDate.format(new Date(event.createdAt))}</time>
                </li>
              ))}
            </ul>
          ) : (
            <div className={ui.emptyState}>
              <h3>No publishing activity</h3>
              <p>Create the first draft to begin the audit trail.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
