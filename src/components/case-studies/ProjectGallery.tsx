"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import styles from "./ProjectGallery.module.css";

type ProjectGalleryProps = {
  title: string;
  images: string[];
};

export default function ProjectGallery({ title, images }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const activeImage = images[activeIndex];

  const previous = useCallback(() => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowLeft" && images.length > 1) previous();
      if (event.key === "ArrowRight" && images.length > 1) next();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, images.length, next, previous]);

  if (!images.length) {
    return (
      <div className={styles.empty}>
        <span>No public screenshots</span>
        <strong>{title}</strong>
        <p>The project detail and engineering case study remain available below.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gallery}>
        <div className={styles.stage}>
          <button
            type="button"
            className={styles.imageButton}
            onClick={() => setOpen(true)}
            aria-label={`Expand ${title} screenshot ${activeIndex + 1}`}
          >
            <Image
              src={activeImage}
              alt={`${title} screenshot ${activeIndex + 1}`}
              fill
              sizes="(max-width: 1360px) 100vw, 1360px"
            />
            <span className={styles.expand}>
              <Expand aria-hidden="true" />
              Expand
            </span>
          </button>
          {images.length > 1 && (
            <GalleryControls previous={previous} next={next} />
          )}
        </div>

        {images.length > 1 && (
          <div className={styles.thumbnails}>
            {images.map((image, index) => (
              <button
                type="button"
                className={index === activeIndex ? styles.thumbnailActive : styles.thumbnail}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${title} screenshot ${index + 1}`}
                aria-pressed={index === activeIndex}
                key={image}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 45vw, 220px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`${title} gallery`}>
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setOpen(false)}
            aria-label="Close gallery"
          />
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Close gallery"
              autoFocus
            >
              <X aria-hidden="true" />
            </button>
            <div className={styles.modalImage}>
              <Image
                src={activeImage}
                alt={`${title} enlarged screenshot ${activeIndex + 1}`}
                fill
                sizes="95vw"
                priority
              />
            </div>
            {images.length > 1 && <GalleryControls previous={previous} next={next} />}
            <span className={styles.counter}>
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

function GalleryControls({ previous, next }: { previous: () => void; next: () => void }) {
  return (
    <>
      <button
        type="button"
        className={`${styles.control} ${styles.controlPrevious}`}
        onClick={previous}
        aria-label="Previous screenshot"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${styles.control} ${styles.controlNext}`}
        onClick={next}
        aria-label="Next screenshot"
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </>
  );
}
