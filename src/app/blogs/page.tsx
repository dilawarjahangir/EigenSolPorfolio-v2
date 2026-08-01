import type { Metadata } from "next";
import BlogGridPage from "@/components/blogs/BlogGridPage";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";
import JsonLd from "@/components/seo/JsonLd";
import { blogPosts } from "@/data/blogs";
import { breadcrumbJsonLd, buildPageMetadata, collectionJsonLd } from "@/lib/seo";

const title = "EigenSol Insights | Software, AI, Design & Cloud";
const description =
  "Practical EigenSol articles about software architecture, product engineering, AI, design systems, mobile development, cloud, and DevOps.";

export const metadata: Metadata = buildPageMetadata({ title, description, path: "/blogs" });

export default function BlogsPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd(
            title,
            description,
            "/blogs",
            blogPosts.map((post) => ({ name: post.title, path: `/blogs/${post.slug}` })),
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
          <BlogGridPage />
        </main>
        <CreativeStudioFooter />
      </AgntixInnerPageExperience>
    </>
  );
}
