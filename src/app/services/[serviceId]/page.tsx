import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import ServiceDetailsPage from "@/components/services/ServiceDetailsPage";
import ServiceFourExperience from "@/components/services/ServiceFourExperience";
import JsonLd from "@/components/seo/JsonLd";
import { getServiceBySlug, serviceOfferings } from "@/data/services";
import { breadcrumbJsonLd, buildPageMetadata, serviceJsonLd } from "@/lib/seo";

type ServiceDetailRouteProps = {
  params: Promise<{ serviceId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceOfferings.map((service) => ({ serviceId: service.slug }));
}

export async function generateMetadata({
  params,
}: ServiceDetailRouteProps): Promise<Metadata> {
  const { serviceId } = await params;
  const service = getServiceBySlug(serviceId);

  if (!service) {
    return {
      title: "Service Not Found | EigenSol",
      description: "The requested EigenSol service page could not be found.",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    title: `${service.title} | EigenSol`,
    description: service.shortDescription,
    path: `/services/${service.slug}`,
    image: service.media?.banner ?? "/agntix-service-details/service-details-banner.jpg",
  });
}

export default async function ServiceDetailRoute({ params }: ServiceDetailRouteProps) {
  const { serviceId } = await params;
  const service = getServiceBySlug(serviceId);

  if (!service) notFound();

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd(service),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />
      <Header />
      <ServiceFourExperience key={service.slug}>
        <main>
          <ServiceDetailsPage service={service} />
        </main>
        <CreativeStudioFooter />
      </ServiceFourExperience>
    </>
  );
}
