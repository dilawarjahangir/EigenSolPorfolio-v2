import type { Metadata } from "next";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import ServiceFourExperience from "@/components/services/ServiceFourExperience";
import ServiceFourPage from "@/components/services/ServiceFourPage";
import JsonLd from "@/components/seo/JsonLd";
import { serviceOfferings } from "@/data/services";
import { breadcrumbJsonLd, buildPageMetadata, collectionJsonLd } from "@/lib/seo";

const title = "Software Development Services | EigenSol";
const description =
  "Explore EigenSol services across custom software, web and mobile applications, UI/UX systems, cloud and DevOps, and AI engineering.";

export const metadata: Metadata = buildPageMetadata({ title, description, path: "/services" });

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd(
            title,
            description,
            "/services",
            serviceOfferings.map((service) => ({
              name: service.title,
              path: `/services/${service.slug}`,
            })),
          ),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
        ]}
      />
      <Header />
      <ServiceFourExperience>
        <main>
          <ServiceFourPage />
        </main>
        <CreativeStudioFooter />
      </ServiceFourExperience>
    </>
  );
}
