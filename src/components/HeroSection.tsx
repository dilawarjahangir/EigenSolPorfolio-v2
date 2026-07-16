import BlueprintLogoReveal from "./BlueprintLogoReveal";

export default function HeroSection() {
  return (
    <section
      id="home"
      aria-label="EigenSol introduction"
      className="grid min-h-screen place-items-center overflow-hidden bg-white px-6"
    >
      <BlueprintLogoReveal size={420} duration={4} background="transparent" />
    </section>
  );
}
