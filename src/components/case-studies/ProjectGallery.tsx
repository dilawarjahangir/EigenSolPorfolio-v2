"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import styles from "./ProjectGallery.module.css";

type ProjectGalleryProps = {
  title: string;
  images: string[];
  aspectRatio?: string;
  initialOrientation?: "landscape" | "portrait";
};

export default function ProjectGallery({
  title,
  images,
  aspectRatio = "16 / 10",
  initialOrientation = "landscape",
}: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [imageOrientations, setImageOrientations] = useState<
    Record<string, "landscape" | "portrait">
  >({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeImage = images[activeIndex] ?? images[0];
  const activeOrientation = imageOrientations[activeImage] ?? initialOrientation;
  const galleryStyle = { "--gallery-aspect-ratio": aspectRatio } as CSSProperties;

  const previous = useCallback(() => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
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

  if (!images.length || !activeImage) {
    return (
      <div className={styles.empty}>
        <span>Private visual archive</span>
        <strong>{title}</strong>
        <p>Public screenshots are unavailable for this delivery.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.gallery} tp_fade_anim`} style={galleryStyle}>
        <div className={styles.stage}>
          <button
            ref={triggerRef}
            type="button"
            className={styles.imageButton}
            data-orientation={activeOrientation}
            onClick={() => setOpen(true)}
            aria-label={`Expand ${title} screenshot ${activeIndex + 1}`}
          >
            <Image
              src={activeImage}
              alt={`${title} screenshot ${activeIndex + 1}`}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1540px) 94vw, 1460px"
              onLoad={(event) => {
                const orientation =
                  event.currentTarget.naturalHeight > event.currentTarget.naturalWidth
                    ? "portrait"
                    : "landscape";

                setImageOrientations((current) =>
                  current[activeImage] === orientation
                    ? current
                    : { ...current, [activeImage]: orientation },
                );
              }}
            />
            <span className={styles.expand}>
              <Expand aria-hidden="true" />
              Open full screen
            </span>
          </button>
          {images.length > 1 && <GalleryControls previous={previous} next={next} />}
        </div>

        {images.length > 1 && (
          <div
            className={styles.thumbnailRail}
            role="group"
            aria-label={`${title} gallery thumbnails`}
          >
            {images.map((image, index) => (
              <button
                type="button"
                className={index === activeIndex ? styles.thumbnailActive : styles.thumbnail}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${title} screenshot ${index + 1}`}
                aria-pressed={index === activeIndex}
                key={`${image}-${index}`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 42vw, (max-width: 1540px) 22vw, 320px"
                />
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.modal}
        aria-label={`${title} image gallery`}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
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
              sizes="96vw"
            />
          </div>
          {images.length > 1 && <GalleryControls previous={previous} next={next} />}
          <span className={styles.counter} role="status" aria-live="polite">
            {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
        </div>
      </dialog>
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
