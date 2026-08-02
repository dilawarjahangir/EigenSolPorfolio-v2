import Link from "next/link";
import { notFound } from "next/navigation";
import ui from "@/components/admin/AdminUi.module.css";
import BlogDetailsPage from "@/components/blogs/BlogDetailsPage";
import { requireOwner } from "@/services/auth/AdminAuthService";
import {
  BlogCmsNotFoundError,
  BlogCmsValidationError,
  getBlogPostForEditing,
  getBlogPostRevision,
} from "@/services/blog-posts/BlogPostService";
import { buildBlogPostPreview } from "@/services/blog-posts/BlogPreviewService";
import styles from "../../Preview.module.css";

type RevisionPreviewPageProps = Readonly<{
  params: Promise<{ id: string; revisionId: string }>;
}>;

export default async function AdminRevisionPreviewPage({ params }: RevisionPreviewPageProps) {
  await requireOwner();
  const { id, revisionId } = await params;

  const [post, revision] = await Promise.all([
      getBlogPostForEditing(id),
      getBlogPostRevision(id, revisionId),
    ]).catch((error: unknown) => {
      if (error instanceof BlogCmsNotFoundError || error instanceof BlogCmsValidationError) {
        notFound();
      }
      throw error;
    });
  return (
      <div className={styles.root}>
        <div className={styles.previewBar}>
          <strong>Private preview · revision {revision.revisionNumber}</strong>
          <Link className={ui.buttonSecondary} href={`/admin/posts/${post.id}/edit`}>Back to editor</Link>
        </div>
        <BlogDetailsPage
          post={buildBlogPostPreview(post, revision)}
          nextPost={null}
          comments={[]}
          preview
        />
      </div>
  );
}
