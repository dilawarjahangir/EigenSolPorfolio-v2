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
