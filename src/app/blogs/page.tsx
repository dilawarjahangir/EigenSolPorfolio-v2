import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import BlogGridPage from "@/components/blogs/BlogGridPage";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildPageMetadata, collectionJsonLd } from "@/lib/seo";
import { listPublishedBlogPosts } from "@/services/blog-posts/BlogPostService";

const title = "EigenSol Insights | Software, AI, Design & Cloud";
const description =
  "Practical EigenSol articles about software architecture, product engineering, AI, design systems, mobile development, cloud, and DevOps.";

type BlogsPageProps = Readonly<{
  searchParams: Promise<{ page?: string }>;
}>;

const PAGE_SIZE = 6;

function requestedPage(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export async function generateMetadata({ searchParams }: BlogsPageProps): Promise<Metadata> {
  const page = requestedPage((await searchParams).page);
  return buildPageMetadata({
    title: page === 1 ? title : `${title} — Page ${page}`,
    description,
    path: page === 1 ? "/blogs" : `/blogs?page=${page}`,
  });
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  await connection();
  const page = requestedPage((await searchParams).page);
  const posts = await listPublishedBlogPosts({ page, pageSize: PAGE_SIZE });
  if (page > 1 && (posts.totalPages === 0 || page > posts.totalPages)) notFound();

  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd(
            title,
            description,
            "/blogs",
            posts.posts.map((post) => ({ name: post.title, path: `/blogs/${post.slug}` })),
          ),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/blogs" },
          ]),
        ]}
      />
      <Header />
      <AgntixInnerPageExperience>
        <main>
          <BlogGridPage page={posts} />
        </main>
        <CreativeStudioFooter />
      </AgntixInnerPageExperience>
    </>
  );
}
