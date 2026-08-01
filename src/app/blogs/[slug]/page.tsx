import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailsPage from "@/components/blogs/BlogDetailsPage";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";
import JsonLd from "@/components/seo/JsonLd";
import { blogPosts, getBlogPostBySlug, getNextBlogPost } from "@/data/blogs";
import { articleJsonLd, breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type BlogDetailsRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export const generateStaticParams = () => {
  const params: Array<{ slug: string }> = [];

  for (const post of blogPosts) {
    params.push({ slug: post.slug });
  }

  return params;
};

export async function generateMetadata({
  params,
}: BlogDetailsRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | EigenSol",
      description: "The requested EigenSol article could not be found.",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: `${post.title} | EigenSol Insights`,
    description: post.excerpt,
    path: `/blogs/${post.slug}`,
    image: post.image,
    type: "article",
    publishedTime: post.publishedAt,
  });
}

export default async function BlogDetailsRoute({ params }: BlogDetailsRouteProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

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
          <BlogDetailsPage post={post} nextPost={getNextBlogPost(post.slug)} />
        </main>
        <CreativeStudioFooter />
      </AgntixInnerPageExperience>
    </>
  );
}
