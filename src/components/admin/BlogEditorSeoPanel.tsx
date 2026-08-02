"use client";

import { CheckCircle2, CircleAlert, Gauge, Link2, Search, Sparkles } from "lucide-react";
import type { Ref } from "react";
import { getSeoLengthTone } from "@/lib/blog-editor-utils";
import { seoConfig } from "@/lib/seo";
import styles from "./BlogEditorSeoPanel.module.css";

type BlogEditorSeoPanelProps = Readonly<{
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  hasShareImage: boolean;
  slugInputRef?: Ref<HTMLInputElement>;
  slugError?: string;
  seoTitleError?: string;
  seoDescriptionError?: string;
  onSlugChange: (value: string) => void;
  onSlugBlur: () => void;
  onUseGeneratedSlug: () => void;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
}>;

type SeoMeterProps = Readonly<{
  id: string;
  label: string;
  value: string;
  minimum: number;
  maximum: number;
}>;

function SeoMeter({ id, label, value, minimum, maximum }: SeoMeterProps) {
  const length = value.trim().length;
  const tone = getSeoLengthTone(value, minimum, maximum);
  const message =
    tone === "empty"
      ? "Uses the article fallback when blank."
      : tone === "short"
        ? `Consider at least ${minimum} characters.`
        : tone === "long"
          ? `May be truncated after ${maximum} characters.`
          : "Length is within the usual preview range.";

  return (
    <div className={styles.meter} data-tone={tone} id={id}>
      <div><span>{label}</span><strong>{length}/{maximum}</strong></div>
      <progress value={Math.min(length, maximum)} max={maximum} aria-label={`${label} character usage`} />
      <p>{message}</p>
    </div>
  );
}

export function BlogEditorSeoPanel({
  title,
  slug,
  excerpt,
  seoTitle,
  seoDescription,
  hasShareImage,
  slugInputRef,
  slugError,
  seoTitleError,
  seoDescriptionError,
  onSlugChange,
  onSlugBlur,
  onUseGeneratedSlug,
  onSeoTitleChange,
  onSeoDescriptionChange,
}: BlogEditorSeoPanelProps) {
  const effectiveTitle = seoTitle.trim() || title.trim() || "Your article title";
  const effectiveDescription =
    seoDescription.trim() || excerpt.trim() || "Your article description will appear here.";
  const resolvedSlug = slug || "article-slug";
  const canonicalUrl = `${seoConfig.origin}/blogs/${resolvedSlug}`;
  const titleReady = getSeoLengthTone(effectiveTitle, 35, 60) === "good";
  const descriptionReady = getSeoLengthTone(effectiveDescription, 120, 160) === "good";
  const checks = [
    { label: "Search title", ready: titleReady, help: "Aim for a clear 35–60 character title." },
    { label: "Search description", ready: descriptionReady, help: "Aim for a useful 120–160 character summary." },
    { label: "Canonical path", ready: Boolean(slug), help: "A clean lowercase URL is required." },
    { label: "Sharing image", ready: hasShareImage, help: "Select a social or cover image in Media." },
  ];
  const readyCount = checks.filter((check) => check.ready).length;

  return (
    <div className={styles.root}>
      <section className={styles.hero} aria-labelledby="seo-workspace-heading">
        <div>
          <p><Sparkles aria-hidden="true" /> Search appearance</p>
          <h2 id="seo-workspace-heading">Shape how this article is introduced.</h2>
          <span>Overrides are optional. Empty fields inherit the article title and excerpt.</span>
        </div>
        <div className={styles.readiness} aria-label={`${readyCount} of ${checks.length} search checks ready`}>
          <Gauge aria-hidden="true" />
          <strong>{readyCount}/{checks.length}</strong>
          <span>checks ready</span>
        </div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.formCard} aria-labelledby="seo-metadata-heading">
          <div className={styles.sectionHeading}>
            <Link2 aria-hidden="true" />
            <div><h3 id="seo-metadata-heading">Metadata</h3><p>Fine-tune the URL and social copy.</p></div>
          </div>

          <div className={styles.field}>
            <label htmlFor="blog-post-slug">Article URL</label>
            <div className={styles.inputAction}>
              <input
                ref={slugInputRef}
                id="blog-post-slug"
                name="slug"
                value={slug}
                onChange={(event) => onSlugChange(event.target.value)}
                onBlur={onSlugBlur}
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                maxLength={160}
                spellCheck={false}
                aria-invalid={slugError ? "true" : undefined}
                aria-describedby={slugError ? "blog-post-slug-error" : "blog-post-slug-help"}
              />
              <button type="button" onClick={onUseGeneratedSlug} disabled={!title.trim()}>Use title</button>
            </div>
            <small id="blog-post-slug-help">{canonicalUrl}</small>
            {slugError ? <small className={styles.error} id="blog-post-slug-error">{slugError}</small> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="blog-post-seo-title">SEO title <em>Optional</em></label>
            <div className={styles.inputAction}>
              <input
                id="blog-post-seo-title"
                name="seoTitle"
                value={seoTitle}
                onChange={(event) => onSeoTitleChange(event.target.value)}
                maxLength={200}
                placeholder={title || "Uses the article title"}
                aria-invalid={seoTitleError ? "true" : undefined}
                aria-describedby={seoTitleError ? "blog-post-seo-title-error" : "blog-post-seo-title-meter"}
              />
              <button type="button" onClick={() => onSeoTitleChange(title)} disabled={!title.trim()}>Use title</button>
            </div>
            {seoTitleError ? <small className={styles.error} id="blog-post-seo-title-error">{seoTitleError}</small> : null}
            <SeoMeter id="blog-post-seo-title-meter" label="Title length" value={effectiveTitle} minimum={35} maximum={60} />
          </div>

          <div className={styles.field}>
            <label htmlFor="blog-post-seo-description">SEO description <em>Optional</em></label>
            <textarea
              id="blog-post-seo-description"
              name="seoDescription"
              value={seoDescription}
              onChange={(event) => onSeoDescriptionChange(event.target.value)}
              maxLength={320}
              placeholder="Uses the article excerpt"
              aria-invalid={seoDescriptionError ? "true" : undefined}
              aria-describedby={seoDescriptionError ? "blog-post-seo-description-error" : "blog-post-seo-description-meter"}
            />
            <button
              className={styles.copyAction}
              type="button"
              onClick={() => onSeoDescriptionChange(excerpt)}
              disabled={!excerpt.trim()}
            >
              Use article excerpt
            </button>
            {seoDescriptionError ? <small className={styles.error} id="blog-post-seo-description-error">{seoDescriptionError}</small> : null}
            <SeoMeter id="blog-post-seo-description-meter" label="Description length" value={effectiveDescription} minimum={120} maximum={160} />
          </div>
        </section>

        <aside className={styles.checkCard} aria-labelledby="seo-checklist-heading">
          <div className={styles.sectionHeading}>
            <Search aria-hidden="true" />
            <div><h3 id="seo-checklist-heading">Publishing checks</h3><p>Helpful signals, not a ranking guarantee.</p></div>
          </div>
          <ul>
            {checks.map((check) => {
              const Icon = check.ready ? CheckCircle2 : CircleAlert;
              return (
                <li key={check.label} data-ready={check.ready ? "true" : undefined}>
                  <Icon aria-hidden="true" />
                  <div><strong>{check.label}</strong><span>{check.help}</span></div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      <section className={styles.preview} aria-labelledby="search-preview-heading">
        <header>
          <div><p>Search preview</p><h3 id="search-preview-heading">Google-style result</h3></div>
          <span>{readyCount === checks.length ? "Ready" : "Needs review"}</span>
        </header>
        <div className={styles.browser}>
          <div className={styles.dots} aria-hidden="true"><span /><span /><span /></div>
          <p className={styles.domain}>eigensol.com › blogs › {resolvedSlug}</p>
          <h4>{effectiveTitle}</h4>
          <p>{effectiveDescription}</p>
        </div>
      </section>
    </div>
  );
}
