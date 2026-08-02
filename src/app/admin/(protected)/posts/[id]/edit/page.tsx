import { Archive, CalendarX2, Globe2, RotateCcw, Undo2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { BlogPostEditorForm } from "@/components/admin/BlogPostEditorForm";
import ui from "@/components/admin/AdminUi.module.css";
import { requireOwner } from "@/services/auth/AdminAuthService";
import {
  BlogCmsNotFoundError,
  BlogCmsValidationError,
  getBlogPostForEditing,
  listBlogMediaAssets,
  listBlogPostRevisions,
} from "@/services/blog-posts/BlogPostService";
import {
  archiveBlogPostAction,
  cancelBlogScheduleAction,
  restoreBlogPostAction,
  restoreBlogRevisionAction,
  unpublishBlogPostAction,
} from "../../actions";

type EditPostPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const pakistanDate = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

export default async function EditAdminPostPage({ params, searchParams }: EditPostPageProps) {
  await requireOwner();
  const { id } = await params;
  const query = await searchParams;

  const [post, media, revisions] = await Promise.all([
      getBlogPostForEditing(id),
      listBlogMediaAssets({ limit: 100 }),
      listBlogPostRevisions(id, { limit: 50 }),
    ]).catch((error: unknown) => {
      if (error instanceof BlogCmsNotFoundError || error instanceof BlogCmsValidationError) {
        notFound();
      }
      throw error;
    });
  const notice = typeof query.notice === "string" ? query.notice : null;

  return (
      <div className={ui.page}>
        <header className={ui.pageHeader}>
          <div className={ui.pageHeaderCopy}>
            <p className={ui.eyebrow}>Post editor</p>
            <h1 className={ui.title}>Edit blog post</h1>
            <p className={ui.description}>
              {post.currentRevision.title} · version {post.version} · revision {post.currentRevision.revisionNumber} · working /{post.currentRevision.slug}
              {post.currentRevision.slug !== post.slug ? ` · live /${post.slug}` : ""}
            </p>
          </div>
          {post.status === "published" ? (
            <div className={ui.actions}>
              <Link className={ui.buttonGhost} href={`/blogs/${post.slug}`} target="_blank" rel="noreferrer">
                <Globe2 aria-hidden="true" />
                View live
              </Link>
            </div>
          ) : null}
        </header>

        {notice ? <div className={ui.successNotice}>Post workflow updated.</div> : null}

        {post.activeSchedule ? (
          <section className={ui.panel} aria-labelledby="active-schedule-heading">
            <div className={ui.panelHeader}>
              <div>
                <h2 id="active-schedule-heading">Scheduled {post.activeSchedule.action}</h2>
                <p className={ui.description}>
                  {pakistanDate.format(new Date(post.activeSchedule.executeAt))} PKT · frozen revision {post.activeSchedule.revisionId}
                </p>
              </div>
              {post.activeSchedule.status === "pending" ? (
                <form action={cancelBlogScheduleAction}>
                  <input type="hidden" name="scheduleId" value={post.activeSchedule.id} />
                  <input type="hidden" name="postId" value={post.id} />
                  <AdminConfirmButton
                    confirmation="Cancel this scheduled publication?"
                    pendingLabel="Cancelling…"
                    tone="secondary"
                  >
                    <CalendarX2 aria-hidden="true" />
                    Cancel schedule
                  </AdminConfirmButton>
                </form>
              ) : null}
            </div>
          </section>
        ) : null}

        {post.status === "archived" ? (
          <section className={ui.panel}>
            <h2>Archived post</h2>
            <p className={ui.description}>
              Archived content is not public and cannot be edited. Restore it to its last published state first.
            </p>
            <form action={restoreBlogPostAction}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="expectedVersion" value={post.version} />
              <AdminConfirmButton
                confirmation="Restore this post? Its last published revision will become public again when available."
                pendingLabel="Restoring…"
                tone="primary"
              >
                <RotateCcw aria-hidden="true" />
                Restore post
              </AdminConfirmButton>
            </form>
          </section>
        ) : (
          <BlogPostEditorForm key={post.currentRevisionId} post={post} media={media.assets} />
        )}

        <section className={ui.panel} aria-labelledby="revision-history-heading">
          <div className={ui.panelHeader}>
            <h2 id="revision-history-heading">Revision history</h2>
            <span className={ui.badge}>{revisions.length} retained</span>
          </div>
          <ul className={ui.activityList}>
            {revisions.map((revision) => (
              <li key={revision.id}>
                <div>
                  <strong>Revision {revision.revisionNumber}: {revision.title}</strong>
                  <span>
                    {pakistanDate.format(new Date(revision.createdAt))}
                    {revision.isCurrent ? " · working" : ""}
                    {revision.isPublished ? " · published" : ""}
                  </span>
                </div>
                <div className={ui.inlineActions}>
                  <Link
                    className={ui.buttonGhost}
                    href={`/admin/posts/${post.id}/revisions/${revision.id}`}
                  >
                    Preview
                  </Link>
                  {!revision.isCurrent && post.status !== "archived" ? (
                    <form action={restoreBlogRevisionAction}>
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="expectedVersion" value={post.version} />
                      <input type="hidden" name="revisionId" value={revision.id} />
                      <AdminConfirmButton
                        confirmation="Create a new working revision from this snapshot? This will not publish it."
                        pendingLabel="Restoring…"
                        tone="ghost"
                      >
                        <Undo2 aria-hidden="true" />
                        Restore
                      </AdminConfirmButton>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {post.status !== "archived" ? (
          <section className={`${ui.panel} ${ui.dangerPanel}`} aria-labelledby="post-danger-heading">
            <h2 id="post-danger-heading">Post state</h2>
            <div className={ui.inlineActions}>
              {post.status === "published" ? (
                <form action={unpublishBlogPostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="expectedVersion" value={post.version} />
                  <AdminConfirmButton
                    confirmation="Unpublish this post? Its public URL will return 404 until it is published again."
                    pendingLabel="Unpublishing…"
                    tone="secondary"
                  >
                    Unpublish
                  </AdminConfirmButton>
                </form>
              ) : null}
              <form action={archiveBlogPostAction}>
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="expectedVersion" value={post.version} />
                <AdminConfirmButton
                  confirmation="Archive this post? Scheduled publication will be cancelled and the public URL will return 404."
                  pendingLabel="Archiving…"
                >
                  <Archive aria-hidden="true" />
                  Archive
                </AdminConfirmButton>
              </form>
            </div>
          </section>
        ) : null}
      </div>
  );
}
