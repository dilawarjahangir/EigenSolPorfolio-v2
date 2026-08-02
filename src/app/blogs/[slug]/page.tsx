import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { connection } from "next/server";
import BlogDetailsPage from "@/components/blogs/BlogDetailsPage";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";
import JsonLd from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getApprovedBlogComments } from "@/services/blog-comments/BlogCommentService";
import {
  getNextPublishedBlogPost,
  getPublishedBlogPostBySlug,
} from "@/services/blog-posts/BlogPostService";

type BlogDetailsRouteProps = {
  params: Promise<{ slug: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogDetailsRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const resolution = await getPublishedBlogPostBySlug(slug);

  if (!resolution) {
    return {
      title: "Article Not Found | EigenSol",
      description: "The requested EigenSol article could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const post = resolution.post;

  return buildPageMetadata({
    title: post.seoTitle || `${post.title} | EigenSol Insights`,
    description: post.seoDescription || post.excerpt,
    path: `/blogs/${resolution.canonicalSlug}`,
    image: post.socialImage?.asset.publicUrl ?? post.image?.asset.publicUrl,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.modifiedAt ?? undefined,
  });
}

export default async function BlogDetailsRoute({ params }: BlogDetailsRouteProps) {
  const { slug } = await params;
  await connection();
  const resolution = await getPublishedBlogPostBySlug(slug);

  if (!resolution) notFound();
  if (resolution.redirect) permanentRedirect(`/blogs/${resolution.canonicalSlug}`);

  const post = resolution.post;
  const comments = await getApprovedBlogComments(post.slug);
  const nextPost = await getNextPublishedBlogPost(post.id);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(post),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/blogs" },
            { name: post.title, path: `/blogs/${post.slug}` },
          ]),
        ]}
      />
      <Header />
      <AgntixInnerPageExperience>
        <main>
          <BlogDetailsPage
            post={post}
            nextPost={nextPost}
            comments={comments}
          />
        </main>
        <CreativeStudioFooter />
      </AgntixInnerPageExperience>
    </>
  );
}
