import type { Metadata } from "next";
import BlogGridPage from "@/components/blogs/BlogGridPage";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";

export const metadata: Metadata = {
  title: "EigenSol Insights | Software, AI, Design and Cloud",
  description:
    "Practical EigenSol articles about software architecture, product engineering, AI, design systems, mobile development, cloud, and DevOps.",
};

export default function BlogsPage() {
  return (
    <>
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
