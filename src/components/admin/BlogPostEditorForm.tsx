"use client";

import type { JSONContent } from "@tiptap/core";
import { CalendarClock, ExternalLink, Save, Send } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type {
  BlogMediaAsset,
  BlogPostAdminRecord,
  BlogPostRevisionInput,
  BlogRevisionMediaInput,
} from "@/contracts/blog-cms";
import {
  saveBlogPostAction,
} from "@/app/admin/(protected)/posts/actions";
import type { AdminPostActionState } from "@/contracts/admin-actions";
import ui from "./AdminUi.module.css";
import styles from "./BlogPostEditorForm.module.css";

const BlogContentEditor = dynamic(
  () => import("./BlogContentEditor").then((module) => module.BlogContentEditor),
  {
    ssr: false,
    loading: () => (
      <div className={styles.editorLoading} role="status">
        Loading editor…
      </div>
    ),
  },
);

const initialActionState: AdminPostActionState = { status: "idle" };

type BlogPostEditorFormProps = Readonly<{
  post: BlogPostAdminRecord | null;
  media: readonly BlogMediaAsset[];
}>;

type MediaFieldProps = Readonly<{
  label: string;
  role: BlogRevisionMediaInput["role"];
  media: readonly BlogMediaAsset[];
  selected: BlogRevisionMediaInput | undefined;
}>;

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");
}

function pakistanDateTimeInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function mediaForRole(
  revision: BlogPostRevisionInput,
  role: BlogRevisionMediaInput["role"],
) {
  return revision.media.find((reference) => reference.role === role);
}

function MediaField({ label, role, media, selected }: MediaFieldProps) {
  const id = `post-${role}-media`;

  return (
    <fieldset className={styles.mediaField}>
      <legend>{label}</legend>
      <label htmlFor={id}>Asset</label>
      <select
        className={ui.select}
        id={id}
        name={`${role}MediaId`}
        defaultValue={selected?.mediaId ?? ""}
      >
        <option value="">No image</option>
        {media.map((asset) => (
          <option value={asset.id} key={asset.id}>
            {asset.originalFilename}
          </option>
        ))}
      </select>
      <label htmlFor={`${id}-alt`}>Alternative text</label>
      <input
        className={ui.input}
        id={`${id}-alt`}
        name={`${role}AltText`}
        defaultValue={selected?.altText ?? ""}
        maxLength={300}
        placeholder="Describe the image"
      />
      <label className={ui.checkbox}>
        <input
          name={`${role}Decorative`}
          type="checkbox"
          defaultChecked={selected?.decorative === true}
        />
        This image is decorative
      </label>
      <span className={ui.helpText}>
        Required whenever this image conveys information. Leave empty only for decorative artwork.
      </span>
    </fieldset>
  );
}

export function BlogPostEditorForm({ post, media }: BlogPostEditorFormProps) {
  const router = useRouter();
  const revision = post?.currentRevision;
  const [state, formAction, pending] = useActionState(saveBlogPostAction, initialActionState);
  const [title, setTitle] = useState(revision?.title ?? "");
  const [slug, setSlug] = useState(revision?.slug ?? post?.slug ?? "");
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(post));
  const [content, setContent] = useState<JSONContent>(
    (revision?.content.doc as JSONContent | undefined) ?? { type: "doc", content: [{ type: "paragraph" }] },
  );
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!dirty || pending) return;
      event.preventDefault();
    };

    const warnBeforeLinkNavigation = (event: MouseEvent) => {
      if (
        !dirty ||
        pending ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.href === window.location.href) return;
      if (window.confirm("Discard the unsaved changes to this post?")) return;

      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    document.addEventListener("click", warnBeforeLinkNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
      document.removeEventListener("click", warnBeforeLinkNavigation, true);
    };
  }, [dirty, pending]);

  useEffect(() => {
    if (state.status !== "success") return;
    const resetDirtyState = window.setTimeout(() => setDirty(false), 0);

    if (state.redirectTo) {
      router.replace(state.redirectTo);
    } else {
      router.refresh();
    }
    return () => window.clearTimeout(resetDirtyState);
  }, [router, state]);

  const changeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    if (!slugWasEdited) setSlug(slugify(nextTitle));
    setDirty(true);
  };

  const changeSlug = (event: ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(event.target.value));
    setSlugWasEdited(true);
    setDirty(true);
  };

  const editorMedia = media.map((asset) => ({
    id: asset.id,
    url: asset.publicUrl,
    label: asset.originalFilename,
    width: asset.width ?? 1600,
    height: asset.height ?? 900,
  }));

  return (
    <form
      action={formAction}
      className={styles.form}
      ref={formRef}
      onInput={() => setDirty(true)}
    >
      <input name="postId" type="hidden" value={post?.id ?? ""} />
      <input name="expectedVersion" type="hidden" value={post?.version ?? 0} />
      <input name="contentDocument" type="hidden" value={JSON.stringify(content)} />

      {state.status === "validation" ||
      state.status === "authorization" ||
      state.status === "conflict" ||
      state.status === "error" ? (
        <div className={ui.errorNotice} role="alert">
          <strong>{state.message}</strong>
          {state.status === "validation" && state.fieldErrors.length ? (
            <ul>
              {state.fieldErrors.map((error) => (
                <li key={`${error.field}-${error.message}`}>{error.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className={ui.successNotice} role="status">
          {state.message}
        </div>
      ) : null}

      <section className={ui.formPanel} aria-labelledby="post-content-heading">
        <div className={ui.panelHeader}>
          <h2 id="post-content-heading">Article</h2>
          <span className={ui.badge} data-tone={post?.status === "published" ? "success" : "warning"}>
            {post?.status ?? "new draft"}
          </span>
        </div>

        <div className={ui.formGrid}>
          <label className={ui.fieldWide}>
            <span>Title</span>
            <input
              className={ui.input}
              name="title"
              value={title}
              onChange={changeTitle}
              required
              minLength={3}
              maxLength={200}
              autoFocus={!post}
            />
          </label>
          <label className={ui.fieldWide}>
            <span>Slug</span>
            <input
              className={ui.input}
              name="slug"
              value={slug}
              onChange={changeSlug}
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              maxLength={160}
              spellCheck={false}
            />
            <span className={ui.helpText}>Public URL: /blogs/{slug || "article-slug"}</span>
          </label>
          <label className={ui.fieldWide}>
            <span>Excerpt</span>
            <textarea
              className={ui.textarea}
              name="excerpt"
              defaultValue={revision?.excerpt ?? ""}
              required
              minLength={20}
              maxLength={500}
            />
          </label>
          <label className={ui.field}>
            <span>Category</span>
            <input
              className={ui.input}
              name="category"
              defaultValue={revision?.category ?? ""}
              required
              maxLength={100}
            />
          </label>
          <label className={ui.field}>
            <span>Tags</span>
            <input
              className={ui.input}
              name="tags"
              defaultValue={revision?.tags.join(", ") ?? ""}
              maxLength={600}
              placeholder="Engineering, Architecture"
            />
          </label>
          <label className={ui.field}>
            <span>YouTube video ID (optional)</span>
            <input
              className={ui.input}
              name="videoId"
              defaultValue={revision?.videoId ?? ""}
              maxLength={32}
              pattern="[A-Za-z0-9_-]{6,32}"
            />
          </label>
        </div>

        <div className={styles.editorField}>
          <span>Content</span>
          <BlogContentEditor
            initialContent={content}
            media={editorMedia}
            onChange={(nextContent) => {
              setContent(nextContent);
              setDirty(true);
            }}
            onSaveShortcut={() => formRef.current?.requestSubmit(saveButtonRef.current)}
          />
          <span className={ui.helpText}>Use Ctrl+S or Command+S to save a draft.</span>
        </div>
      </section>

      <section className={ui.formPanel} aria-labelledby="post-author-heading">
        <h2 id="post-author-heading">Author</h2>
        <div className={ui.formGrid}>
          <label className={ui.field}>
            <span>Name</span>
            <input
              className={ui.input}
              name="author"
              defaultValue={revision?.author ?? "EigenSol Engineering"}
              required
              maxLength={100}
            />
          </label>
          <label className={ui.field}>
            <span>Role</span>
            <input
              className={ui.input}
              name="authorRole"
              defaultValue={revision?.authorRole ?? "Engineering Team"}
              required
              maxLength={100}
            />
          </label>
          <label className={ui.fieldWide}>
            <span>Biography</span>
            <textarea
              className={ui.textarea}
              name="authorBio"
              defaultValue={revision?.authorBio ?? ""}
              maxLength={1000}
            />
          </label>
        </div>
      </section>

      <section className={ui.formPanel} aria-labelledby="post-media-heading">
        <div className={ui.panelHeader}>
          <h2 id="post-media-heading">Media</h2>
          <Link className={ui.buttonSecondary} href="/admin/media">
            Manage uploads
            <ExternalLink aria-hidden="true" />
          </Link>
        </div>
        {media.length ? (
          <div className={styles.mediaGrid}>
            <MediaField
              label="Cover image (required to publish)"
              role="cover"
              media={media}
              selected={revision ? mediaForRole(revision, "cover") : undefined}
            />
            <MediaField
              label="Hero image"
              role="hero"
              media={media}
              selected={revision ? mediaForRole(revision, "hero") : undefined}
            />
            <MediaField
              label="Social image"
              role="social"
              media={media}
              selected={revision ? mediaForRole(revision, "social") : undefined}
            />
            <MediaField
              label="Byline avatar"
              role="byline-avatar"
              media={media}
              selected={revision ? mediaForRole(revision, "byline-avatar") : undefined}
            />
            <MediaField
              label="Author profile"
              role="author-profile"
              media={media}
              selected={revision ? mediaForRole(revision, "author-profile") : undefined}
            />
          </div>
        ) : (
          <div className={ui.notice}>
            Upload at least one image before publishing. Drafts can still be saved without media.
          </div>
        )}
      </section>

      <section className={ui.formPanel} aria-labelledby="post-seo-heading">
        <h2 id="post-seo-heading">Search and social</h2>
        <div className={ui.formGrid}>
          <label className={ui.fieldWide}>
            <span>SEO title (optional)</span>
            <input
              className={ui.input}
              name="seoTitle"
              defaultValue={revision?.seoTitle ?? ""}
              maxLength={200}
              placeholder="Uses the article title when blank"
            />
          </label>
          <label className={ui.fieldWide}>
            <span>SEO description (optional)</span>
            <textarea
              className={ui.textarea}
              name="seoDescription"
              defaultValue={revision?.seoDescription ?? ""}
              maxLength={320}
              placeholder="Uses the excerpt when blank"
            />
          </label>
        </div>
      </section>

      <section className={styles.publishBar} aria-label="Save and publish controls">
        <div>
          <strong>{dirty ? "Unsaved changes" : "All changes saved"}</strong>
          <span>Publishing promotes this exact revision; later draft edits remain private.</span>
        </div>
        <div className={ui.inlineActions}>
          <button
            className={ui.buttonSecondary}
            type="submit"
            name="intent"
            value="save"
            ref={saveButtonRef}
            disabled={pending}
          >
            <Save aria-hidden="true" />
            {pending ? "Working…" : "Save draft"}
          </button>
          <label className={styles.scheduleField}>
            <span>Schedule in Pakistan Standard Time</span>
            <input
              className={ui.input}
              name="scheduleAt"
              type="datetime-local"
              defaultValue={
                post?.activeSchedule?.action === "publish"
                  ? pakistanDateTimeInput(post.activeSchedule.executeAt)
                  : ""
              }
            />
          </label>
          <button
            className={ui.buttonSecondary}
            type="submit"
            name="intent"
            value="schedule"
            disabled={pending}
          >
            <CalendarClock aria-hidden="true" />
            Schedule
          </button>
          <button
            className={ui.button}
            type="submit"
            name="intent"
            value="publish"
            disabled={pending || !media.length}
          >
            <Send aria-hidden="true" />
            Publish now
          </button>
        </div>
      </section>
    </form>
  );
}
