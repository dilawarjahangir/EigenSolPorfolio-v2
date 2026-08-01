import CreativeProjectsSection, {
  CreativeProjectsCursor,
} from "@/components/CreativeProjectsSection";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import CreativeTeamSection from "@/components/CreativeTeamSection";
import ClientTestimonialsSection from "@/components/ClientTestimonialsSection";
import FunFactsSection from "@/components/FunFactsSection";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HomeScrollControl from "@/components/HomeScrollControl";
import HomePageExperience from "@/components/HomePageExperience";
import PositioningBanner from "@/components/PositioningBanner";
import ServicesSection from "@/components/ServicesSection";
import TrustedPartnersSection from "@/components/TrustedPartnersSection";
import VideoSection from "@/components/VideoSection";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "EigenSol | Custom Software, Web, Mobile, AI & Cloud",
  description:
    "EigenSol designs and engineers custom software, web and mobile products, AI solutions, and cloud platforms for businesses worldwide.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Header />
      <HomeScrollControl>
        <HomePageExperience>
          <main>
            <HeroSection />
            <PositioningBanner />
            <ServicesSection />
            <VideoSection />
            <CreativeProjectsSection />
            <FunFactsSection />
            <CreativeTeamSection />
            <ClientTestimonialsSection />
            <TrustedPartnersSection />
          </main>
          <CreativeStudioFooter />
        </HomePageExperience>
      </HomeScrollControl>
      <CreativeProjectsCursor />
    </>
  );
}
import type { Metadata } from "next";
