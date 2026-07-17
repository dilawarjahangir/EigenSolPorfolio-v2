import CreativeProjectsSection, {
  CreativeProjectsCursor,
} from "@/components/CreativeProjectsSection";
import CreativeTeamSection from "@/components/CreativeTeamSection";
import ClientTestimonialsSection from "@/components/ClientTestimonialsSection";
import FunFactsSection from "@/components/FunFactsSection";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HomePageExperience from "@/components/HomePageExperience";
import PositioningBanner from "@/components/PositioningBanner";
import ServicesSection from "@/components/ServicesSection";
import VideoSection from "@/components/VideoSection";

export default function Home() {
  return (
    <>
      <Header />
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
        </main>
      </HomePageExperience>
      <CreativeProjectsCursor />
    </>
  );
}
