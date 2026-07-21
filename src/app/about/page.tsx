import type { Metadata } from "next";
import AboutUsExperience from "@/components/about/AboutUsExperience";
import AboutUsPage from "@/components/about/AboutUsPage";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "About EigenSol | Product Engineering Team",
  description:
    "Meet EigenSol and the people, capabilities, and delivery process behind our software, web, mobile, cloud, and AI products.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <AboutUsExperience>
        <main>
          <AboutUsPage />
        </main>
        <CreativeStudioFooter />
      </AboutUsExperience>
    </>
  );
}
