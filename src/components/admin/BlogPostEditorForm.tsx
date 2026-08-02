"use client";

import type { JSONContent } from "@tiptap/core";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  Link2,
  PanelRightOpen,
  Save,
  Send,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  memo,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { saveBlogPostAction } from "@/app/admin/(protected)/posts/actions";
import type { AdminPostActionState } from "@/contracts/admin-actions";
import type {
  BlogMediaAsset,
  BlogPostAdminRecord,
  BlogPostRevisionInput,
  BlogRevisionMediaInput,
} from "@/contracts/blog-cms";
import {
  countBlogEditorWords,
  estimateBlogReadingMinutes,
} from "@/lib/blog-editor-utils";
import { AdminSelect, type AdminSelectOption } from "./AdminSelect";
import { BlogEditorMediaUpload } from "./BlogEditorMediaUpload";
import { BlogEditorSeoPanel } from "./BlogEditorSeoPanel";
import ui from "./AdminUi.module.css";
import styles from "./BlogPostEditorForm.module.css";

const BlogContentEditor = dynamic(
  () => import("./BlogContentEditor").then((module) => module.BlogContentEditor),
  {
    ssr: false,
    loading: () => <div className={styles.editorLoading} role="status">Loading editor…</div>,
  },
);

const initialActionState: AdminPostActionState = { status: "idle" };
const editorTabs = ["content", "media", "seo"] as const;
const editorMediaRoles = [
  "cover",
  "hero",
  "social",
  "byline-avatar",
  "author-profile",
] as const;
type EditorTab = (typeof editorTabs)[number];
type EditorMediaRole = Extract<
  BlogRevisionMediaInput["role"],
  "cover" | "hero" | "social" | "byline-avatar" | "author-profile"
>;
type MediaSelections = Readonly<Record<EditorMediaRole, string>>;
type MediaValidity = Readonly<Record<EditorMediaRole, boolean>>;

type BlogPostEditorFormProps = Readonly<{
  post: BlogPostAdminRecord | null;
  media: readonly BlogMediaAsset[];
}>;

type MediaFieldProps = Readonly<{
  label: string;
  description: string;
  role: EditorMediaRole;
  media: readonly BlogMediaAsset[];
  selected: BlogRevisionMediaInput | undefined;
  selectedAssetId: string;
  onAssetChange: (role: EditorMediaRole, mediaId: string) => void;
  onValidityChange?: (role: EditorMediaRole, valid: boolean) => void;
  onDirty: () => void;
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

function normalizeSlugInput(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/g, "")
    .slice(0, 160);
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

function initialMediaSelections(revision: BlogPostRevisionInput | undefined): MediaSelections {
  return {
    cover: revision ? mediaForRole(revision, "cover")?.mediaId ?? "" : "",
    hero: revision ? mediaForRole(revision, "hero")?.mediaId ?? "" : "",
    social: revision ? mediaForRole(revision, "social")?.mediaId ?? "" : "",
    "byline-avatar": revision ? mediaForRole(revision, "byline-avatar")?.mediaId ?? "" : "",
    "author-profile": revision ? mediaForRole(revision, "author-profile")?.mediaId ?? "" : "",
  };
}

function fieldError(state: AdminPostActionState, field: string) {
  if (state.status !== "validation") return undefined;
  return state.fieldErrors.find((error) => error.field === field)?.message;
}

function joinIds(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

function FieldError({ id, message }: Readonly<{ id: string; message?: string }>) {
  return message ? <span className={styles.fieldError} id={id}>{message}</span> : null;
}

const MediaField = memo(function MediaField({
  label,
  description,
  role,
  media,
  selected,
  selectedAssetId,
  onAssetChange,
  onValidityChange,
  onDirty,
}: MediaFieldProps) {
  const id = `post-${role}-media`;
  const [altText, setAltText] = useState(selected?.altText ?? "");
  const [decorative, setDecorative] = useState(selected?.decorative === true);
  const selectedAsset = media.find((asset) => asset.id === selectedAssetId);
  const valid = Boolean(selectedAssetId && (decorative || altText.trim()));
  const options: AdminSelectOption[] = [{ value: "", label: "No image" }];
  for (const asset of media) {
    options.push({
      value: asset.id,
      label: asset.originalFilename,
      description: asset.width && asset.height ? `${asset.width} × ${asset.height}` : undefined,
    });
  }

  useEffect(() => onValidityChange?.(role, valid), [onValidityChange, role, valid]);

  return (
    <fieldset className={styles.mediaField}>
      <legend>{label}</legend>
      <p>{description}</p>
      <div className={styles.mediaPreview} data-empty={selectedAsset ? undefined : "true"}>
        {selectedAsset ? (
          <Image
            src={selectedAsset.publicUrl}
            alt={`Preview of ${selectedAsset.originalFilename}`}
            width={selectedAsset.width ?? 640}
            height={selectedAsset.height ?? 420}
            sizes="(max-width: 48rem) 100vw, 22rem"
            unoptimized
          />
        ) : (
          <span><ImageIcon aria-hidden="true" /> No image selected</span>
        )}
      </div>
      <AdminSelect
        id={id}
        name={`${role}MediaId`}
        label="Asset"
        value={selectedAssetId}
        options={options}
        onValueChange={(mediaId) => {
          const usesSavedAssignment = mediaId !== "" && mediaId === selected?.mediaId;
          setAltText(usesSavedAssignment ? selected.altText : "");
          setDecorative(usesSavedAssignment ? selected.decorative : false);
          onAssetChange(role, mediaId);
          onDirty();
        }}
      />
      <label htmlFor={`${id}-alt`}>Alternative text</label>
      <input
        className={ui.input}
        id={`${id}-alt`}
        name={`${role}AltText`}
        value={altText}
        onChange={(event) => {
          setAltText(event.target.value);
          onDirty();
        }}
        disabled={!selectedAssetId || decorative}
        maxLength={300}
        placeholder="Describe what the image shows"
      />
      <label className={ui.checkbox} htmlFor={`${id}-decorative`}>
        <input
          id={`${id}-decorative`}
          name={`${role}Decorative`}
          type="checkbox"
          checked={decorative}
          disabled={!selectedAssetId}
          onChange={(event) => {
            setDecorative(event.target.checked);
            onDirty();
          }}
        />
        This image is decorative
      </label>
      {selectedAssetId && !valid ? (
        <span className={styles.mediaWarning}>Add alternative text or mark the image decorative.</span>
      ) : null}
    </fieldset>
  );
});

export function BlogPostEditorForm({ post, media }: BlogPostEditorFormProps) {
  const router = useRouter();
  const revision = post?.currentRevision;
  const [state, formAction, pending] = useActionState(saveBlogPostAction, initialActionState);
  const [title, setTitle] = useState(revision?.title ?? "");
  const [slug, setSlug] = useState(revision?.slug ?? post?.slug ?? "");
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(revision?.excerpt ?? "");
  const [category, setCategory] = useState(revision?.category ?? "");
  const [author, setAuthor] = useState(revision?.author ?? "EigenSol Engineering");
  const [authorRole, setAuthorRole] = useState(revision?.authorRole ?? "Engineering Team");
  const [scheduleAt, setScheduleAt] = useState(
    post?.activeSchedule?.action === "publish"
      ? pakistanDateTimeInput(post.activeSchedule.executeAt)
      : "",
  );
  const [seoTitle, setSeoTitle] = useState(revision?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(revision?.seoDescription ?? "");
  const [content, setContent] = useState<JSONContent>(
    (revision?.content.doc as JSONContent | undefined) ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
  );
  const [availableMedia, setAvailableMedia] = useState<readonly BlogMediaAsset[]>(() => {
    const assetsById = new Map(media.map((asset) => [asset.id, asset]));
    for (const reference of revision?.media ?? []) {
      assetsById.set(reference.asset.id, reference.asset);
    }
    return [...assetsById.values()];
  });
  const [mediaSelections, setMediaSelections] = useState<MediaSelections>(() =>
    initialMediaSelections(revision),
  );
  const [mediaValidity, setMediaValidity] = useState<MediaValidity>({
    cover: false,
    hero: false,
    social: false,
    "byline-avatar": false,
    "author-profile": false,
  });
  const [activeTab, setActiveTab] = useState<EditorTab>("content");
  const [dirty, setDirty] = useState(false);
  const [expectedVersion, setExpectedVersion] = useState(post?.version ?? 0);
  const [pendingIntent, setPendingIntent] = useState<"save" | "schedule" | "publish" | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compactSettings, setCompactSettings] = useState(false);
  const changeVersionRef = useRef(0);
  const submittedChangeVersionRef = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsCloseRef = useRef<HTMLButtonElement>(null);
  const restoreSettingsFocusRef = useRef(true);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const markDirty = useCallback(() => {
    changeVersionRef.current += 1;
    setDirty(true);
  }, []);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const closeSettingsForValidation = useCallback(() => {
    restoreSettingsFocusRef.current = false;
    setSettingsOpen(false);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 76rem)");
    const updateMode = () => setCompactSettings(mediaQuery.matches);
    updateMode();
    mediaQuery.addEventListener("change", updateMode);
    return () => mediaQuery.removeEventListener("change", updateMode);
  }, []);

  useEffect(() => {
    if (!compactSettings || !settingsOpen) return;
    const previousOverflow = document.body.style.overflow;
    const settingsTrigger = settingsButtonRef.current;
    restoreSettingsFocusRef.current = true;
    document.body.style.overflow = "hidden";
    settingsCloseRef.current?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSettings();
        return;
      }
      if (event.key !== "Tab") return;
      const candidates = settingsPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      );
      const focusable = candidates
        ? Array.from(candidates).filter(
            (element) => element.tagName === "SUMMARY" || !element.closest("details:not([open])"),
          )
        : [];
      if (!focusable.length) return;
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (restoreSettingsFocusRef.current) settingsTrigger?.focus();
      restoreSettingsFocusRef.current = true;
    };
  }, [closeSettings, compactSettings, settingsOpen]);

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
      ) return;
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
    if (state.status === "idle") return;
    const responseTimer = window.setTimeout(() => {
      setPendingIntent(null);
      if (state.status === "success") {
        const hasNewerChanges = submittedChangeVersionRef.current !== changeVersionRef.current;
        setExpectedVersion(state.version);
        if (!hasNewerChanges) setDirty(false);
        closeSettings();
        if (state.redirectTo) router.replace(state.redirectTo);
        else if (!hasNewerChanges) router.refresh();
        return;
      }

      if (state.status === "validation") {
        const firstField = state.fieldErrors[0]?.field;
        const fieldTab: EditorTab | null =
          firstField === "slug" || firstField === "seoTitle" || firstField === "seoDescription"
            ? "seo"
            : firstField?.includes("Media")
              ? "media"
              : firstField === "title" || firstField === "excerpt" || firstField === "contentDocument"
                ? "content"
                : null;
        const sidebarField = [
          "scheduleAt",
          "category",
          "tags",
          "videoId",
          "author",
          "authorRole",
          "authorBio",
        ].includes(firstField ?? "");
        if (fieldTab) setActiveTab(fieldTab);
        if (compactSettings) {
          if (sidebarField) setSettingsOpen(true);
          else closeSettingsForValidation();
        }
        window.setTimeout(() => {
          const element = firstField
            ? formRef.current?.elements.namedItem(firstField)
            : null;
          if (element instanceof HTMLElement && !element.matches('input[type="hidden"]')) {
            element.focus();
          } else {
            noticeRef.current?.focus();
          }
        }, 0);
      } else {
        if (compactSettings) closeSettingsForValidation();
        window.setTimeout(() => noticeRef.current?.focus(), 0);
      }
    }, 0);
    return () => window.clearTimeout(responseTimer);
  }, [closeSettings, closeSettingsForValidation, compactSettings, router, state]);

  const changeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    if (!slugWasEdited) setSlug(slugify(nextTitle));
    markDirty();
  };

  const changeSlug = (value: string) => {
    setSlug(normalizeSlugInput(value));
    setSlugWasEdited(true);
    markDirty();
  };

  const useGeneratedSlug = () => {
    setSlug(slugify(title));
    setSlugWasEdited(false);
    markDirty();
  };

  const selectTab = (tab: EditorTab, focus = false) => {
    setActiveTab(tab);
    if (focus) {
      const index = editorTabs.indexOf(tab);
      window.setTimeout(() => tabRefs.current[index]?.focus(), 0);
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % editorTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + editorTabs.length) % editorTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = editorTabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(editorTabs[nextIndex], true);
  };

  const editSlug = () => {
    selectTab("seo");
    window.setTimeout(() => slugInputRef.current?.focus(), 0);
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    submittedChangeVersionRef.current = changeVersionRef.current;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement ? submitter.value : "save";
    if (intent === "save" || intent === "schedule" || intent === "publish") {
      setPendingIntent(intent);
    }
  };

  const handleMediaUploaded = useCallback((asset: BlogMediaAsset) => {
    setAvailableMedia((current) => {
      const existing = current.findIndex((candidate) => candidate.id === asset.id);
      if (existing < 0) return [asset, ...current];
      const next = [...current];
      next[existing] = asset;
      return next;
    });
  }, []);

  const handleMediaAssetChange = useCallback((role: EditorMediaRole, mediaId: string) => {
    setMediaSelections((current) => (
      current[role] === mediaId ? current : { ...current, [role]: mediaId }
    ));
  }, []);

  const handleMediaValidityChange = useCallback((role: EditorMediaRole, valid: boolean) => {
    setMediaValidity((current) => (
      current[role] === valid ? current : { ...current, [role]: valid }
    ));
  }, []);

  const editorMedia = useMemo(() => {
    const options = [];
    for (const asset of availableMedia) {
      options.push({
        id: asset.id,
        url: asset.publicUrl,
        label: asset.originalFilename,
        width: asset.width ?? 1600,
        height: asset.height ?? 900,
      });
    }
    return options;
  }, [availableMedia]);
  const wordCount = useMemo(() => countBlogEditorWords(content), [content]);
  const readingMinutes = estimateBlogReadingMinutes(wordCount);
  const selectedMediaCount = Object.values(mediaSelections).filter(Boolean).length;
  const hasCover = Boolean(mediaSelections.cover);
  const allSelectedMediaAccessible = editorMediaRoles.every(
    (role) => !mediaSelections[role] || mediaValidity[role],
  );
  const hasArticleContent = wordCount > 0;
  const publishDetailsReady = title.trim().length >= 3
    && excerpt.trim().length >= 20
    && Boolean(category.trim() && author.trim() && authorRole.trim());
  const canPublish = hasCover
    && allSelectedMediaAccessible
    && hasArticleContent
    && publishDetailsReady;
  const readinessTitle = !hasArticleContent
    ? "Article body needs content"
    : !hasCover
      ? "Cover image needs attention"
      : !allSelectedMediaAccessible
        ? "Image accessibility needs attention"
        : !publishDetailsReady
          ? "Publishing details need attention"
          : "Article is ready to publish";
  const readinessDescription = !hasArticleContent
    ? "Add meaningful text to the article body before publishing."
    : !hasCover
      ? "Select a cover and add alt text, or mark it decorative."
      : !allSelectedMediaAccessible
        ? "Every selected image needs alt text or a decorative setting."
        : !publishDetailsReady
          ? "Complete the title, excerpt, category, author name, and author role."
          : "The article body, metadata, and selected media meet publishing requirements.";
  const postStatus = post?.status ?? "new draft";
  const saveState = pending
    ? "Saving revision…"
    : dirty
      ? "Unsaved changes"
      : post
        ? "All changes saved"
        : "New draft";
  const validationError = (field: string) => fieldError(state, field);

  return (
    <form
      action={formAction}
      className={styles.form}
      ref={formRef}
      aria-busy={pending}
      noValidate
      onInput={markDirty}
      onSubmit={onFormSubmit}
    >
      <input name="postId" type="hidden" value={post?.id ?? ""} />
      <input name="expectedVersion" type="hidden" value={expectedVersion} />
      <input name="contentDocument" type="hidden" value={JSON.stringify(content)} />

      {state.status === "validation" || state.status === "authorization" || state.status === "conflict" || state.status === "error" ? (
        <div ref={noticeRef} className={ui.errorNotice} role="alert" tabIndex={-1}>
          <strong>{state.message}</strong>
          {state.status === "validation" && state.fieldErrors.length ? (
            <ul>{state.fieldErrors.map((error) => <li key={`${error.field}-${error.message}`}>{error.message}</li>)}</ul>
          ) : null}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div ref={noticeRef} className={ui.successNotice} role="status" tabIndex={-1}>{state.message}</div>
      ) : null}

      <header className={styles.actionHeader}>
        <div className={styles.editorSummary}>
          <span className={ui.badge} data-tone={post?.status === "published" ? "success" : "warning"}>{postStatus}</span>
          <span className={styles.saveState} data-dirty={dirty ? "true" : undefined}>
            <CheckCircle2 aria-hidden="true" /> {saveState}
          </span>
          <span><FileText aria-hidden="true" /> {wordCount} {wordCount === 1 ? "word" : "words"}</span>
          <span><Clock3 aria-hidden="true" /> {readingMinutes} min read</span>
        </div>
        <div className={styles.headerActions}>
          {post ? (
            <Link className={ui.buttonGhost} href={`/admin/posts/${post.id}/preview`} target="_blank" rel="noreferrer">
              <Eye aria-hidden="true" /> Preview saved
            </Link>
          ) : null}
          <button
            ref={settingsButtonRef}
            className={`${ui.buttonGhost} ${styles.settingsButton}`}
            type="button"
            aria-controls="blog-post-settings"
            aria-expanded={settingsOpen}
            disabled={pending}
            onClick={() => setSettingsOpen(true)}
          >
            <PanelRightOpen aria-hidden="true" /> Settings
          </button>
          <button ref={saveButtonRef} className={ui.buttonSecondary} type="submit" name="intent" value="save" disabled={pending}>
            <Save aria-hidden="true" /> {pending && pendingIntent === "save" ? "Saving…" : "Save draft"}
          </button>
          <button className={ui.button} type="submit" name="intent" value="publish" disabled={pending || !canPublish} title={!canPublish ? "Complete the article body and accessible media before publishing" : undefined}>
            <Send aria-hidden="true" /> {pending && pendingIntent === "publish" ? "Publishing…" : "Publish now"}
          </button>
        </div>
      </header>

      <div className={styles.workspace} {...(!post && pending ? { inert: true } : {})}>
        <div className={styles.mainColumn}>
          <div className={styles.tabs} role="tablist" aria-label="Blog editor workspace">
            {editorTabs.map((tab, index) => (
              <button
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`editor-${tab}-tab`}
                key={tab}
                type="button"
                role="tab"
                aria-controls={`editor-${tab}-panel`}
                aria-selected={activeTab === tab}
                tabIndex={activeTab === tab ? 0 : -1}
                data-active={activeTab === tab ? "true" : undefined}
                onClick={() => selectTab(tab)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {tab === "content" ? "Write" : tab === "media" ? "Media" : "SEO"}
                {tab === "media" ? <span>{selectedMediaCount}/5</span> : null}
              </button>
            ))}
          </div>

          <section
            className={styles.writingPanel}
            id="editor-content-panel"
            role="tabpanel"
            aria-labelledby="editor-content-tab"
            hidden={activeTab !== "content"}
          >
            <div className={styles.titleField}>
              <label htmlFor="blog-post-title">Article title</label>
              <input
                id="blog-post-title"
                name="title"
                value={title}
                onChange={changeTitle}
                required
                maxLength={200}
                autoFocus={!post}
                placeholder="Write a clear, specific headline…"
                aria-invalid={validationError("title") ? "true" : undefined}
                aria-describedby={joinIds("blog-post-title-help", validationError("title") ? "blog-post-title-error" : undefined)}
              />
              <div className={styles.permalink} id="blog-post-title-help">
                <Link2 aria-hidden="true" />
                <span>eigensol.com/blogs/{slug || "article-slug"}</span>
                <button type="button" onClick={editSlug}>Edit URL</button>
              </div>
              <FieldError id="blog-post-title-error" message={validationError("title")} />
            </div>

            <label className={styles.excerptField} htmlFor="blog-post-excerpt">
              <span>Excerpt <em>Required to publish</em><strong>{excerpt.length}/500</strong></span>
              <textarea
                id="blog-post-excerpt"
                name="excerpt"
                value={excerpt}
                onChange={(event) => {
                  setExcerpt(event.target.value);
                  markDirty();
                }}
                maxLength={500}
                placeholder="Summarize the article for cards, search results, and social previews."
                aria-invalid={validationError("excerpt") ? "true" : undefined}
                aria-describedby={validationError("excerpt") ? "blog-post-excerpt-error" : undefined}
              />
              <FieldError id="blog-post-excerpt-error" message={validationError("excerpt")} />
            </label>

            <div className={styles.editorField}>
              <div className={styles.editorFieldHeader}>
                <div><span>Article body</span><small>Use the media tool in the editor rail to add images or galleries.</small></div>
                <span>Ctrl/⌘ + S saves</span>
              </div>
              <BlogContentEditor
                initialContent={content}
                media={editorMedia}
                onChange={(nextContent) => {
                  setContent(nextContent);
                  markDirty();
                }}
                onMediaUploaded={handleMediaUploaded}
                onSaveShortcut={() => formRef.current?.requestSubmit(saveButtonRef.current)}
              />
            </div>
          </section>

          <section
            className={styles.secondaryPanel}
            id="editor-media-panel"
            role="tabpanel"
            aria-labelledby="editor-media-tab"
            hidden={activeTab !== "media"}
          >
            <header className={styles.panelHeading}>
              <div><p>Media assignments</p><h2>Choose imagery for every public surface.</h2><span>Cover is required to publish. Other placements are optional.</span></div>
              <div>
                <BlogEditorMediaUpload onUploaded={handleMediaUploaded} />
                <Link className={ui.buttonGhost} href="/admin/media" target="_blank" rel="noreferrer">Library <ExternalLink aria-hidden="true" /></Link>
              </div>
            </header>
            {availableMedia.length ? (
              <div className={styles.mediaGrid}>
                <MediaField label="Cover image" description="Used on blog cards and as the publication fallback." role="cover" media={availableMedia} selected={revision ? mediaForRole(revision, "cover") : undefined} selectedAssetId={mediaSelections.cover} onAssetChange={handleMediaAssetChange} onValidityChange={handleMediaValidityChange} onDirty={markDirty} />
                <MediaField label="Hero image" description="Displayed near the top of the article page." role="hero" media={availableMedia} selected={revision ? mediaForRole(revision, "hero") : undefined} selectedAssetId={mediaSelections.hero} onAssetChange={handleMediaAssetChange} onValidityChange={handleMediaValidityChange} onDirty={markDirty} />
                <MediaField label="Social image" description="Overrides the cover for Open Graph and social cards." role="social" media={availableMedia} selected={revision ? mediaForRole(revision, "social") : undefined} selectedAssetId={mediaSelections.social} onAssetChange={handleMediaAssetChange} onValidityChange={handleMediaValidityChange} onDirty={markDirty} />
                <MediaField label="Byline avatar" description="Compact author image shown with article metadata." role="byline-avatar" media={availableMedia} selected={revision ? mediaForRole(revision, "byline-avatar") : undefined} selectedAssetId={mediaSelections["byline-avatar"]} onAssetChange={handleMediaAssetChange} onValidityChange={handleMediaValidityChange} onDirty={markDirty} />
                <MediaField label="Author profile" description="Larger author image used in the profile section." role="author-profile" media={availableMedia} selected={revision ? mediaForRole(revision, "author-profile") : undefined} selectedAssetId={mediaSelections["author-profile"]} onAssetChange={handleMediaAssetChange} onValidityChange={handleMediaValidityChange} onDirty={markDirty} />
              </div>
            ) : (
              <div className={ui.notice}>Upload an image here to unlock media assignments and publishing.</div>
            )}
          </section>

          <section
            className={styles.secondaryPanel}
            id="editor-seo-panel"
            role="tabpanel"
            aria-labelledby="editor-seo-tab"
            hidden={activeTab !== "seo"}
          >
            <BlogEditorSeoPanel
              title={title}
              slug={slug}
              excerpt={excerpt}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              hasShareImage={Boolean(mediaSelections.social || mediaSelections.cover)}
              slugInputRef={slugInputRef}
              slugError={validationError("slug")}
              seoTitleError={validationError("seoTitle")}
              seoDescriptionError={validationError("seoDescription")}
              onSlugChange={changeSlug}
              onSlugBlur={() => setSlug((current) => slugify(current))}
              onUseGeneratedSlug={useGeneratedSlug}
              onSeoTitleChange={(value) => { setSeoTitle(value); markDirty(); }}
              onSeoDescriptionChange={(value) => { setSeoDescription(value); markDirty(); }}
            />
          </section>
        </div>

        <button className={styles.settingsBackdrop} type="button" aria-label="Close post settings" data-open={settingsOpen ? "true" : undefined} onClick={closeSettings} />
        <div
          ref={settingsPanelRef}
          className={styles.sidebar}
          id="blog-post-settings"
          aria-label="Post settings"
          role={compactSettings && settingsOpen ? "dialog" : "complementary"}
          aria-modal={compactSettings && settingsOpen ? "true" : undefined}
          data-open={settingsOpen ? "true" : undefined}
          {...(compactSettings && !settingsOpen ? { inert: true } : {})}
        >
          <header className={styles.drawerHeader}>
            <div><strong>Post settings</strong><span>Publishing, details, and author</span></div>
            <button ref={settingsCloseRef} type="button" aria-label="Close post settings" onClick={closeSettings}><X aria-hidden="true" /></button>
          </header>

          <section className={styles.sidebarCard} aria-labelledby="publishing-heading">
            <div className={styles.sidebarHeading}>
              <div><p>Workflow</p><h2 id="publishing-heading">Publishing</h2></div>
              <span className={ui.badge} data-tone={canPublish ? "success" : "warning"}>{canPublish ? "ready" : "needs media"}</span>
            </div>
            <div className={styles.readinessItem} data-ready={canPublish ? "true" : undefined}>
              {canPublish ? <CheckCircle2 aria-hidden="true" /> : <ImageIcon aria-hidden="true" />}
              <div><strong>{readinessTitle}</strong><span>{readinessDescription}</span></div>
            </div>
            {!canPublish && (!hasArticleContent || !hasCover || !allSelectedMediaAccessible) ? (
              <button
                className={styles.textAction}
                type="button"
                onClick={() => {
                  selectTab(hasArticleContent ? "media" : "content");
                  closeSettings();
                }}
              >
                {hasArticleContent ? "Review media" : "Review article"}
              </button>
            ) : null}
            <label className={styles.scheduleField} htmlFor="blog-post-schedule">
              <span>Schedule in Pakistan Standard Time</span>
              <input
                className={ui.input}
                id="blog-post-schedule"
                name="scheduleAt"
                type="datetime-local"
                value={scheduleAt}
                onChange={(event) => {
                  setScheduleAt(event.target.value);
                  markDirty();
                }}
                aria-invalid={validationError("scheduleAt") ? "true" : undefined}
                aria-describedby={validationError("scheduleAt") ? "blog-post-schedule-error" : "blog-post-schedule-help"}
              />
              <small id="blog-post-schedule-help">The selected revision is frozen when scheduled.</small>
              <FieldError id="blog-post-schedule-error" message={validationError("scheduleAt")} />
            </label>
            <button className={ui.buttonSecondary} type="submit" name="intent" value="schedule" disabled={pending || !canPublish || !scheduleAt}>
              <CalendarClock aria-hidden="true" /> {pending && pendingIntent === "schedule" ? "Scheduling…" : "Schedule publication"}
            </button>
            <p className={styles.workflowNote}>Publishing promotes this exact saved revision. Later draft edits remain private.</p>
          </section>

          <section className={styles.sidebarCard} aria-labelledby="post-details-heading">
            <div className={styles.sidebarHeading}><div><p>Classification</p><h2 id="post-details-heading">Post details</h2></div></div>
            <label className={styles.sidebarField} htmlFor="blog-post-category">
              <span>Category <em>Required to publish</em></span>
              <input className={ui.input} id="blog-post-category" name="category" value={category} onChange={(event) => { setCategory(event.target.value); markDirty(); }} maxLength={100} aria-invalid={validationError("category") ? "true" : undefined} aria-describedby={validationError("category") ? "blog-post-category-error" : undefined} />
              <FieldError id="blog-post-category-error" message={validationError("category")} />
            </label>
            <label className={styles.sidebarField} htmlFor="blog-post-tags">
              <span>Tags</span>
              <input className={ui.input} id="blog-post-tags" name="tags" defaultValue={revision?.tags.join(", ") ?? ""} maxLength={600} placeholder="Engineering, Architecture" />
              <small>Separate tags with commas.</small>
            </label>
            <label className={styles.sidebarField} htmlFor="blog-post-video">
              <span>YouTube video ID <em>Optional</em></span>
              <input className={ui.input} id="blog-post-video" name="videoId" defaultValue={revision?.videoId ?? ""} maxLength={32} pattern="[A-Za-z0-9_-]{6,32}" aria-invalid={validationError("videoId") ? "true" : undefined} aria-describedby={validationError("videoId") ? "blog-post-video-error" : undefined} />
              <FieldError id="blog-post-video-error" message={validationError("videoId")} />
            </label>
          </section>

          <details className={styles.sidebarDisclosure} open>
            <summary><span><small>Attribution</small><strong>Author profile</strong></span></summary>
            <div className={styles.disclosureBody}>
              <label className={styles.sidebarField} htmlFor="blog-post-author">
                <span>Name <em>Required to publish</em></span>
                <input className={ui.input} id="blog-post-author" name="author" value={author} onChange={(event) => { setAuthor(event.target.value); markDirty(); }} maxLength={100} aria-invalid={validationError("author") ? "true" : undefined} aria-describedby={validationError("author") ? "blog-post-author-error" : undefined} />
                <FieldError id="blog-post-author-error" message={validationError("author")} />
              </label>
              <label className={styles.sidebarField} htmlFor="blog-post-author-role">
                <span>Role <em>Required to publish</em></span>
                <input className={ui.input} id="blog-post-author-role" name="authorRole" value={authorRole} onChange={(event) => { setAuthorRole(event.target.value); markDirty(); }} maxLength={100} aria-invalid={validationError("authorRole") ? "true" : undefined} aria-describedby={validationError("authorRole") ? "blog-post-author-role-error" : undefined} />
                <FieldError id="blog-post-author-role-error" message={validationError("authorRole")} />
              </label>
              <label className={styles.sidebarField} htmlFor="blog-post-author-bio">
                <span>Biography <em>Optional</em></span>
                <textarea className={ui.textarea} id="blog-post-author-bio" name="authorBio" defaultValue={revision?.authorBio ?? ""} maxLength={1000} />
              </label>
            </div>
          </details>
        </div>
      </div>
    </form>
  );
}
