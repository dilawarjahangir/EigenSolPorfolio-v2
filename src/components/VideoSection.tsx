"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./VideoSection.module.css";

const videoImages = [
  {
    src: "/agntix-home/video/eigensol-mobile-product-planning.webp",
    alt: "Product team planning a mobile application",
    width: 1252,
    height: 880,
  },
  {
    src: "/agntix-home/video/eigensol-cloud-network.webp",
    alt: "Connected cloud network infrastructure",
    width: 1252,
    height: 880,
  },
  {
    src: "/agntix-home/video/eigensol-cloud-city.webp",
    alt: "Cloud computing technology over a cityscape",
    width: 1252,
    height: 880,
  },
  {
    src: "/agntix-home/video/eigensol-digital-development.webp",
    alt: "Laptop displaying digital development technology",
    width: 1252,
    height: 880,
  },
  {
    src: "/agntix-home/video/eigensol-ai-solutions.webp",
    alt: "Artificial intelligence technology solution",
    width: 1252,
    height: 880,
  },
] as const;

const videoPoster = "/agntix-home/video/eigensol-robotics-learning.webp";

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    let interactionPending = false;

    const removeInteractionListeners = () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      interactionPending = false;
    };

    const handleInteraction = () => {
      void video.play();
      removeInteractionListeners();
    };

    const playVideo = () => {
      const playPromise = video.play();

      playPromise?.catch(() => {
        if (interactionPending) return;
        interactionPending = true;
        document.addEventListener("click", handleInteraction);
        document.addEventListener("touchstart", handleInteraction);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      removeInteractionListeners();
    };
  }, []);

  return (
    <section className={`${styles.videoArea} tp-video-area`}>
      <div className={styles.containerFluid}>
        <div className={`${styles.thumbWrap} tp-video-thumb-wrap`}>
          <div className={`${styles.thumb} ${styles.desktopOnly} tp-video-thumb`}>
            <VideoImage image={videoImages[0]} />
          </div>

          <div className={`${styles.thumb} ${styles.marginBottom} tp-video-thumb`}>
            <video ref={videoRef} playsInline loop muted preload="metadata" poster={videoPoster}>
              <source src="/agntix-home/video/eigensol-futuristic-saas.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div
            className={`${styles.thumb} ${styles.desktopOnly} ${styles.marginBottom} tp-video-thumb`}
          >
            <VideoImage image={videoImages[1]} />
          </div>

          <div
            className={`${styles.thumb} ${styles.desktopOnly} ${styles.marginBottom} tp-video-thumb`}
          >
            <VideoImage image={videoImages[2]} />
          </div>

          <div className={`${styles.thumb} ${styles.desktopOnly} tp-video-thumb`}>
            <VideoImage image={videoImages[3]} />
          </div>

          <div className={`${styles.thumb} ${styles.desktopOnly} tp-video-thumb`}>
            <VideoImage image={videoImages[4]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoImage({ image }: { image: (typeof videoImages)[number] }) {
  return (
    <Image
      className={styles.thumbImage}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes="(min-width: 1200px) 32.5vw, 100vw"
    />
  );
}
