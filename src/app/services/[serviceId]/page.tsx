import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import ServiceDetailsPage from "@/components/services/ServiceDetailsPage";
import ServiceFourExperience from "@/components/services/ServiceFourExperience";
import { getServiceBySlug, serviceOfferings } from "@/data/services";

type ServiceDetailRouteProps = {
  params: Promise<{ serviceId: string }>;
};

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
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${service.title} | EigenSol`,
    description: service.shortDescription,
    openGraph: {
      title: `${service.title} | EigenSol`,
      description: service.shortDescription,
      images: [service.media?.banner ?? "/agntix-service-details/service-details-banner.jpg"],
    },
  };
}

export default async function ServiceDetailRoute({ params }: ServiceDetailRouteProps) {
  const { serviceId } = await params;
  const service = getServiceBySlug(serviceId);

  if (!service) notFound();

  return (
    <>
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
