import type { CSSProperties } from "react";

import BlueprintLogoReveal from "./BlueprintLogoReveal";
import styles from "./HeroSection.module.css";

const verticalGuides = [
  0,
  52.8409,
  70.5,
  104.623,
  136.736,
  183.943,
  202.656,
  254.319,
  275.503,
];

const horizontalGuides = [
  -211,
  -163,
  -115,
  -67,
  -19,
  0.58881,
  73.6009,
  97.5,
  141.794,
  185.13,
  255.316,
];

export default function HeroSection() {
  const revealDuration = 2;
  const heroStyle = {
    "--hero-reveal-duration": `${revealDuration}s`,
  } as CSSProperties;

  return (
    <section
      id="home"
      aria-label="EigenSol introduction"
      className={styles.hero}
      style={heroStyle}
    >
      <div className={styles.blueprintGrid}>
        <div className={styles.verticalGuides} aria-hidden="true">
          {verticalGuides.map((position) => (
            <span
              key={position}
              data-grid-x={position}
              style={{ left: `${((position + 5) / 286) * 100}%` }}
            />
          ))}
        </div>

        <div className={styles.horizontalGuides} aria-hidden="true">
          {horizontalGuides.map((position) => (
            <span
              key={position}
              data-grid-y={position}
              style={{ top: `${((position + 5) / 266) * 100}%` }}
            />
          ))}
        </div>

        <BlueprintLogoReveal
          size="100%"
          duration={revealDuration}
          background="transparent"
          className={styles.logoReveal}
        />

        <p className={styles.companyLine}>
          <span>A new</span>
          <span>dimension</span>
          <span>of clarity</span>
        </p>
      </div>
    </section>
  );
}
