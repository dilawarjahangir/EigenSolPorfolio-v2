import Link from "next/link";
import { notFound } from "next/navigation";
import BlogDetailsPage from "@/components/blogs/BlogDetailsPage";
import ui from "@/components/admin/AdminUi.module.css";
import { requireOwner } from "@/services/auth/AdminAuthService";
import {
  BlogCmsNotFoundError,
  BlogCmsValidationError,
  getBlogPostForEditing,
} from "@/services/blog-posts/BlogPostService";
import { buildBlogPostPreview } from "@/services/blog-posts/BlogPreviewService";
import styles from "../Preview.module.css";

type PreviewPageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function AdminPostPreviewPage({ params }: PreviewPageProps) {
  await requireOwner();
  const { id } = await params;

  const post = await getBlogPostForEditing(id).catch((error: unknown) => {
    if (error instanceof BlogCmsNotFoundError || error instanceof BlogCmsValidationError) {
      notFound();
    }
    throw error;
  });
  return (
      <div className={styles.root}>
        <div className={styles.previewBar}>
          <strong>Private working-revision preview</strong>
          <Link className={ui.buttonSecondary} href={`/admin/posts/${post.id}/edit`}>Back to editor</Link>
        </div>
        <BlogDetailsPage post={buildBlogPostPreview(post)} nextPost={null} comments={[]} preview />
      </div>
  );
}
