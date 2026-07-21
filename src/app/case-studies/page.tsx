import type { Metadata } from "next";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import MetroWorkExperience from "@/components/case-studies/MetroWorkExperience";
import MetroWorkPage from "@/components/case-studies/MetroWorkPage";

export const metadata: Metadata = {
  title: "Case Studies | Web, Mobile and AI Projects | EigenSol",
  description:
    "Explore EigenSol case studies across web platforms, mobile products, AI solutions, and custom business software.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <Header />
      <MetroWorkExperience>
        <main>
          <MetroWorkPage />
        </main>
        <CreativeStudioFooter />
      </MetroWorkExperience>
    </>
  );
}
