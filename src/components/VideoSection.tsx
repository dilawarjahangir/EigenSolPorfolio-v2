"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./VideoSection.module.css";

const videoImages = [
  { src: "/agntix-home/video/video-1.jpg", width: 634, height: 440 },
  { src: "/agntix-home/video/video-3.jpg", width: 1252, height: 880 },
  { src: "/agntix-home/video/video-4.jpg", width: 1252, height: 880 },
  { src: "/agntix-home/video/video-5.jpg", width: 1252, height: 880 },
  { src: "/agntix-home/video/video-6.jpg", width: 1252, height: 880 },
] as const;

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
            <VideoImage image={videoImages[0]} alt="video thumbnail" />
          </div>

          <div className={`${styles.thumb} ${styles.marginBottom} tp-video-thumb`}>
            <video ref={videoRef} playsInline loop muted>
              <source src="https://html.aqlova.com/videos/liko/liko.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div
            className={`${styles.thumb} ${styles.desktopOnly} ${styles.marginBottom} tp-video-thumb`}
          >
            <VideoImage image={videoImages[1]} alt="video thumbnail 1" />
          </div>

          <div
            className={`${styles.thumb} ${styles.desktopOnly} ${styles.marginBottom} tp-video-thumb`}
          >
            <VideoImage image={videoImages[2]} alt="video thumbnail 2" />
          </div>

          <div className={`${styles.thumb} ${styles.desktopOnly} tp-video-thumb`}>
            <VideoImage image={videoImages[3]} alt="video thumbnail 3" />
          </div>

          <div className={`${styles.thumb} ${styles.desktopOnly} tp-video-thumb`}>
            <VideoImage image={videoImages[4]} alt="video thumbnail 4" />
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoImage({
  image,
  alt,
}: {
  image: (typeof videoImages)[number];
  alt: string;
}) {
  return (
    <Image
      className={styles.thumbImage}
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      sizes="(min-width: 1200px) 32.5vw, 100vw"
    />
  );
}
