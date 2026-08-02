"use client";

import { Link2, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { isAllowedBlogEditorLink } from "@/lib/blog-editor-utils";
import styles from "./BlogEditorLinkDialog.module.css";

type BlogEditorLinkDialogProps = Readonly<{
  initialValue: string;
  onCancel: () => void;
  onSubmit: (href: string) => void;
}>;

export function BlogEditorLinkDialog({
  initialValue,
  onCancel,
  onSubmit,
}: BlogEditorLinkDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [href, setHref] = useState(initialValue);
  const [error, setError] = useState("");

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [onCancel]);

  const submitLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const normalizedHref = href.trim();
    if (!isAllowedBlogEditorLink(normalizedHref)) {
      setError("Use a site-relative path or a complete HTTP or HTTPS URL.");
      inputRef.current?.focus();
      return;
    }
    onSubmit(normalizedHref);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className={styles.header}>
          <span className={styles.icon} aria-hidden="true"><Link2 /></span>
          <div>
            <h2 id={titleId}>Add a link</h2>
            <p id={descriptionId}>Link selected text to another page or website.</p>
          </div>
          <button type="button" aria-label="Close link dialog" onClick={onCancel}>
            <X aria-hidden="true" />
          </button>
        </header>

        <form
          className={styles.form}
          onInput={(event) => event.stopPropagation()}
          onSubmit={submitLink}
        >
          <label htmlFor={inputId}>Link URL</label>
          <input
            ref={inputRef}
            id={inputId}
            value={href}
            onChange={(event) => {
              setHref(event.target.value);
              if (error) setError("");
            }}
            placeholder="/services or https://example.com"
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : `${inputId}-help`}
            autoComplete="url"
          />
          <span className={styles.help} id={`${inputId}-help`}>
            Relative EigenSol paths and HTTP(S) links are supported.
          </span>
          {error ? <p className={styles.error} id={`${inputId}-error`} role="alert">{error}</p> : null}
          <div className={styles.actions}>
            <button className={styles.cancel} type="button" onClick={onCancel}>Cancel</button>
            <button className={styles.confirm} type="submit">Apply link</button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
