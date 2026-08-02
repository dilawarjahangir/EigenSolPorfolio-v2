import Link from "next/link";
import { BlogPostEditorForm } from "@/components/admin/BlogPostEditorForm";
import ui from "@/components/admin/AdminUi.module.css";
import { requireOwner } from "@/services/auth/AdminAuthService";
import { listBlogMediaAssets } from "@/services/blog-posts/BlogPostService";

export default async function NewAdminPostPage() {
  await requireOwner();
  const media = await listBlogMediaAssets({ limit: 100 });

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div className={ui.pageHeaderCopy}>
          <p className={ui.eyebrow}>New draft</p>
          <h1 className={ui.title}>Create a blog post</h1>
          <p className={ui.description}>
            Saving creates an immutable revision. Nothing is public until you publish or schedule it.
          </p>
        </div>
        <div className={ui.actions}>
          <Link className={ui.buttonGhost} href="/admin/posts">Back to posts</Link>
        </div>
      </header>
      <BlogPostEditorForm post={null} media={media.assets} />
    </div>
  );
}
