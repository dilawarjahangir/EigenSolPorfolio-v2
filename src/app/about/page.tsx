import type { Metadata } from "next";
import AboutUsExperience from "@/components/about/AboutUsExperience";
import AboutUsPage from "@/components/about/AboutUsPage";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildPageMetadata, webPageJsonLd } from "@/lib/seo";

const title = "About EigenSol | Product Engineering Team";
const description =
  "Meet EigenSol and the people, capabilities, and delivery process behind our software, web, mobile, cloud, and AI products.";

export const metadata: Metadata = buildPageMetadata({ title, description, path: "/about" });

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd("AboutPage", title, description, "/about"),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />
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
