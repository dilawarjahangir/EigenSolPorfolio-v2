"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BlueprintLogoReveal from "./BlueprintLogoReveal";
import styles from "./HeroSection.module.css";

const verticalGuides = [0, 52.8409, 70.5, 104.623, 136.736, 183.943, 202.656, 254.319, 275.503];
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealDuration = 2;
  const heroStyle = {
    "--hero-reveal-duration": `${revealDuration}s`,
  } as CSSProperties;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;

    const updatePlayback = () => {
      observer?.disconnect();
      observer = null;

      if (motionPreference.matches) {
        video.pause();
        video.currentTime = 0;
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            void video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(video);
    };

    updatePlayback();
    motionPreference.addEventListener("change", updatePlayback);

    return () => {
      observer?.disconnect();
      motionPreference.removeEventListener("change", updatePlayback);
      video.pause();
    };
  }, []);

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

      <div className={styles.heroMedia}>
        <video
          ref={videoRef}
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/eigensol-hero/eigensol-digital-technology-poster.webp"
          tabIndex={-1}
          aria-hidden="true"
        >
          <source src="/eigensol-hero/eigensol-digital-technology.mp4" type="video/mp4" />
        </video>

        <div className={styles.mediaOverlay}>
          <p className={styles.mediaCopy}>Engineering digital products that scale.</p>
          <Link className={styles.mediaCta} href="/contact">
            Let&apos;s talk
            <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </section>
  );
}
