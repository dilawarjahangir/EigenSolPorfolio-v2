import CreativeProjectsSection, {
  CreativeProjectsCursor,
} from "@/components/CreativeProjectsSection";
import HeroSection from "@/components/HeroSection";
import HomePageExperience from "@/components/HomePageExperience";
import PositioningBanner from "@/components/PositioningBanner";
import ServicesSection from "@/components/ServicesSection";
import VideoSection from "@/components/VideoSection";

export default function Home() {
  return (
    <>
      <HomePageExperience>
        <main>
          <HeroSection />
          <PositioningBanner />
          <ServicesSection />
          <VideoSection />
          <CreativeProjectsSection />
        </main>
      </HomePageExperience>
      <CreativeProjectsCursor />
    </>
  );
}
