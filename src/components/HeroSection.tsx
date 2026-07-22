import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";

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

      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>EigenSol product engineering</p>
        <h1 className={styles.title}>
          <span>Software that makes</span>
          <span>complex work</span>
          <span>feel clear.</span>
        </h1>
        <p className={styles.description}>
          We design and build custom software, web platforms, mobile apps, AI
          workflows, and cloud systems for teams that need dependable digital
          products.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/contact">
            Start a project
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link className={styles.secondaryAction} href="/case-studies">
            View work
          </Link>
        </div>
      </div>

      <a className={styles.scrollCue} href="#solutions" aria-label="Scroll to approach">
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}
