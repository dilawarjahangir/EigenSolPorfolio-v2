import type { Metadata } from "next";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixContactPage from "@/components/contact/AgntixContactPage";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, buildPageMetadata, webPageJsonLd } from "@/lib/seo";

const title = "Contact EigenSol | Start a Software Project";
const description =
  "Contact EigenSol to discuss a software, web, mobile, AI, design, cloud, or DevOps project.";

export const metadata: Metadata = buildPageMetadata({ title, description, path: "/contact" });

type ContactPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { message } = await searchParams;

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd("ContactPage", title, description, "/contact"),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <Header />
      <AgntixInnerPageExperience>
        <main>
          <AgntixContactPage defaultMessage={message} />
        </main>
        <CreativeStudioFooter />
      </AgntixInnerPageExperience>
    </>
  );
}
