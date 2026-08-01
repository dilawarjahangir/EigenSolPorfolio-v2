import type { Metadata } from "next";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import MetroWorkExperience from "@/components/case-studies/MetroWorkExperience";
import MetroWorkPage from "@/components/case-studies/MetroWorkPage";
import JsonLd from "@/components/seo/JsonLd";
import { portfolioProjects } from "@/data/projects";
import { breadcrumbJsonLd, buildPageMetadata, collectionJsonLd } from "@/lib/seo";

const title = "Software Case Studies | Web, Mobile & AI | EigenSol";
const description =
  "Explore EigenSol case studies across web platforms, mobile products, AI solutions, and custom business software.";

export const metadata: Metadata = buildPageMetadata({ title, description, path: "/case-studies" });

export default function CaseStudiesPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd(
            title,
            description,
            "/case-studies",
            portfolioProjects.map((project) => ({
              name: project.title,
              path: `/case-studies/${project.id}`,
            })),
          ),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Case Studies", path: "/case-studies" },
          ]),
        ]}
      />
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
