import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailsPage from "@/components/blogs/BlogDetailsPage";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";
import { blogPosts, getBlogPostBySlug, getNextBlogPost } from "@/data/blogs";

type BlogDetailsRouteProps = {
  params: Promise<{ slug: string }>;
};

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
    return { title: "Article Not Found | EigenSol" };
  }

  return {
    title: `${post.title} | EigenSol Insights`,
    description: post.excerpt,
  };
}

export default async function BlogDetailsRoute({ params }: BlogDetailsRouteProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
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
