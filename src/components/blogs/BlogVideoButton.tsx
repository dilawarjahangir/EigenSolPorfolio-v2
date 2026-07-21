"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import styles from "./BlogPages.module.css";

type BlogVideoButtonProps = {
  videoId: string;
};

export default function BlogVideoButton({ videoId }: BlogVideoButtonProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.videoButton}
        aria-label="Play article video"
        onClick={() => setOpen(true)}
      >
        <Play aria-hidden="true" fill="currentColor" />
      </button>

      {open &&
        createPortal(
          <div
            className={styles.videoModal}
            role="dialog"
            aria-modal="true"
            aria-label="Article video"
          >
            <button
              type="button"
              className={styles.videoBackdrop}
              aria-label="Close video"
              onClick={() => setOpen(false)}
            />
            <div className={styles.videoDialog}>
              <button
                type="button"
                className={styles.videoClose}
                aria-label="Close video"
                onClick={() => setOpen(false)}
                ref={closeButtonRef}
              >
                <X aria-hidden="true" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="EigenSol article video"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
