import type { Metadata } from "next";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import ServiceFourExperience from "@/components/services/ServiceFourExperience";
import ServiceFourPage from "@/components/services/ServiceFourPage";

export const metadata: Metadata = {
  title: "Software Development Services | EigenSol",
  description:
    "Explore EigenSol services across custom software, web and mobile applications, UI/UX systems, cloud and DevOps, and AI engineering.",
};

export default function ServicesPage() {
  return (
    <>
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
