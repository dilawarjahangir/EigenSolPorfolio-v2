"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  Bold,
  Braces,
  Code,
  GalleryHorizontal,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Unlink,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import type { BlogMediaAsset } from "@/contracts/blog-cms";
import { blogContentExtensions } from "@/lib/blog-content-extensions";
import { AdminSelect, type AdminSelectOption } from "./AdminSelect";
import { BlogEditorLinkDialog } from "./BlogEditorLinkDialog";
import { BlogEditorMediaUpload } from "./BlogEditorMediaUpload";
import styles from "./BlogContentEditor.module.css";

export type BlogEditorMediaOption = Readonly<{
  id: string;
  url: string;
  label: string;
  width: number;
  height: number;
}>;

type GalleryItem = Readonly<{
  assetId: string;
  src: string;
  alt: string;
  decorative: boolean;
  caption: string | null;
  width: number;
  height: number;
}>;

type BlogContentEditorProps = Readonly<{
  initialContent: JSONContent;
  media: readonly BlogEditorMediaOption[];
  onChange: (content: JSONContent) => void;
  onMediaUploaded: (asset: BlogMediaAsset) => void;
  onSaveShortcut?: () => void;
}>;

type ToolbarButtonProps = Readonly<{
  label: string;
  active?: boolean;
  disabled?: boolean;
  controls?: string;
  expanded?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  onClick: () => void;
  children: React.ReactNode;
}>;

type ToolbarDock = Readonly<{
  fixed: boolean;
  left: number;
  top: number;
  height: number;
}>;

function ToolbarButton({
  label,
  active,
  disabled = false,
  controls,
  expanded,
  buttonRef,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      ref={buttonRef}
      className={styles.toolbarButton}
      type="button"
      aria-controls={controls}
      aria-expanded={expanded}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      title={label}
      disabled={disabled}
      data-active={active ? "true" : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function BlogContentEditor({
  initialContent,
  media,
  onChange,
  onMediaUploaded,
  onSaveShortcut,
}: BlogContentEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const mediaButtonRef = useRef<HTMLButtonElement>(null);
  const mediaPanelRef = useRef<HTMLFieldSetElement>(null);
  const [toolbarDock, setToolbarDock] = useState<ToolbarDock>({
    fixed: false,
    left: 0,
    top: 0,
    height: 0,
  });
  const [selectedAssetId, setSelectedAssetId] = useState(media[0]?.id ?? "");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [decorative, setDecorative] = useState(false);
  const [galleryItems, setGalleryItems] = useState<readonly GalleryItem[]>([]);
  const [mediaPanelOpen, setMediaPanelOpen] = useState(false);
  const [mediaNotice, setMediaNotice] = useState<Readonly<{
    tone: "success" | "error";
    message: string;
  }> | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [initialLinkHref, setInitialLinkHref] = useState("");

  const editor = useEditor({
    extensions: blogContentExtensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: styles.editorSurface,
        role: "textbox",
        "aria-label": "Article content",
        "aria-multiline": "true",
      },
      handleKeyDown: (_view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          onSaveShortcut?.();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getJSON()),
  });

  const closeLinkDialog = useCallback(() => setLinkDialogOpen(false), []);

  useEffect(() => {
    let frame = 0;
    const mobileQuery = window.matchMedia("(max-width: 48rem)");

    const updateDock = () => {
      frame = 0;
      const root = rootRef.current;
      const toolbar = toolbarRef.current;

      if (!root || !toolbar || mobileQuery.matches) {
        setToolbarDock((current) => (
          current.fixed ? { fixed: false, left: 0, top: 0, height: 0 } : current
        ));
        return;
      }

      const rootBounds = root.getBoundingClientRect();
      const computedTop = Number.parseFloat(window.getComputedStyle(toolbar).top);
      const top = Number.isFinite(computedTop) ? computedTop : 156;
      const viewportHeight = Math.max(0, window.innerHeight - top - 22);
      const editorVisibleHeight = Math.max(0, rootBounds.bottom - top);
      const height = Math.min(viewportHeight, editorVisibleHeight);
      const fixed = rootBounds.top <= top && height > 44;
      const nextDock = {
        fixed,
        left: rootBounds.left,
        top,
        height,
      } satisfies ToolbarDock;

      setToolbarDock((current) => (
        current.fixed === nextDock.fixed &&
        Math.abs(current.left - nextDock.left) < 0.5 &&
        Math.abs(current.top - nextDock.top) < 0.5 &&
        Math.abs(current.height - nextDock.height) < 0.5
          ? current
          : nextDock
      ));
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateDock);
    };

    updateDock();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    mobileQuery.addEventListener("change", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      mobileQuery.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  if (!editor) {
    return <div className={styles.loading} role="status">Loading editor…</div>;
  }

  const openLinkDialog = () => {
    setInitialLinkHref((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkDialogOpen(true);
  };

  const applyLink = (href: string) => {
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkDialogOpen(false);
  };

  const selectedImageAttributes = (): GalleryItem | null => {
    const assetId = media.some((candidate) => candidate.id === selectedAssetId)
      ? selectedAssetId
      : media[0]?.id ?? "";
    const asset = media.find((candidate) => candidate.id === assetId);
    if (!asset) return null;
    const alt = decorative ? "" : imageAlt.trim();
    if (!decorative && !alt) return null;

    return {
      src: asset.url,
      alt,
      assetId: asset.id,
      decorative,
      caption: imageCaption.trim() || null,
      width: asset.width,
      height: asset.height,
    };
  };

  const resetImageFields = () => {
    setImageAlt("");
    setImageCaption("");
    setDecorative(false);
  };

  const insertImage = () => {
    const imageAttributes = selectedImageAttributes();
    if (!imageAttributes) return;
    editor.chain().focus().setImage({
      ...imageAttributes,
      title: imageAttributes.caption,
    } as Parameters<typeof editor.commands.setImage>[0]).run();
    resetImageFields();
  };

  const addGalleryItem = () => {
    const imageAttributes = selectedImageAttributes();
    if (!imageAttributes || galleryItems.length >= 12) return;
    setGalleryItems((items) => items.length >= 12 ? items : [...items, imageAttributes]);
    resetImageFields();
  };

  const insertGallery = () => {
    if (galleryItems.length < 2 || galleryItems.length > 12) return;
    editor.chain().focus().insertContent({
      type: "managedGallery",
      attrs: { items: galleryItems },
    }).run();
    setGalleryItems([]);
  };

  const toggleMediaPanel = () => {
    const nextOpen = !mediaPanelOpen;
    setMediaPanelOpen(nextOpen);
    if (nextOpen) {
      window.setTimeout(() => mediaPanelRef.current?.focus(), 0);
    }
  };

  const closeMediaPanel = () => {
    setMediaPanelOpen(false);
    window.setTimeout(() => mediaButtonRef.current?.focus(), 0);
  };

  const handleToolbarUpload = (asset: BlogMediaAsset) => {
    onMediaUploaded(asset);
    setSelectedAssetId(asset.id);
    setMediaNotice({ tone: "success", message: "Image uploaded. Add alt text or mark it decorative before inserting." });
    setMediaPanelOpen(true);
    window.setTimeout(() => mediaPanelRef.current?.focus(), 0);
  };

  const handleToolbarUploadError = (message: string) => {
    setMediaNotice({ tone: "error", message });
    setMediaPanelOpen(true);
    window.setTimeout(() => mediaPanelRef.current?.focus(), 0);
  };

  const resolvedSelectedAssetId = media.some((asset) => asset.id === selectedAssetId)
    ? selectedAssetId
    : media[0]?.id ?? "";
  const selectedAsset = media.find((asset) => asset.id === resolvedSelectedAssetId);
  const mediaOptions: AdminSelectOption[] = [];
  for (const asset of media) {
    mediaOptions.push({
      value: asset.id,
      label: asset.label,
      description: `${asset.width} × ${asset.height}`,
    });
  }
  const toolbarStyle = {
    "--editor-toolbar-left": `${toolbarDock.left}px`,
    "--editor-toolbar-top": `${toolbarDock.top}px`,
    "--editor-toolbar-height": `${toolbarDock.height}px`,
  } as CSSProperties;

  return (
    <div className={styles.root} ref={rootRef}>
      <div
        className={styles.toolbar}
        data-fixed={toolbarDock.fixed ? "true" : undefined}
        ref={toolbarRef}
        role="toolbar"
        aria-label="Article formatting"
        style={toolbarStyle}
      >
          <div className={styles.toolbarGroup} data-label="Block" role="group" aria-label="Block style">
            <ToolbarButton label="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
              <Pilcrow aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton label="Heading level 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton label="Heading level 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 aria-hidden="true" />
            </ToolbarButton>
          </div>
          <div className={styles.toolbarGroup} data-label="Text" role="group" aria-label="Inline formatting">
            <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Braces aria-hidden="true" /></ToolbarButton>
          </div>
          <div className={styles.toolbarGroup} data-label="Layout" role="group" aria-label="Blocks and lists">
            <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus aria-hidden="true" /></ToolbarButton>
          </div>
          <div className={styles.toolbarGroup} data-label="Insert" role="group" aria-label="Links and media">
            <ToolbarButton label="Add or edit link" active={editor.isActive("link")} onClick={openLinkDialog}><Link2 aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink aria-hidden="true" /></ToolbarButton>
            <ToolbarButton
              label="Insert managed media"
              active={mediaPanelOpen}
              controls="article-media-composer"
              expanded={mediaPanelOpen}
              buttonRef={mediaButtonRef}
              onClick={toggleMediaPanel}
            >
              <ImagePlus aria-hidden="true" />
            </ToolbarButton>
            <BlogEditorMediaUpload
              buttonClassName={styles.toolbarUploadButton}
              iconOnly
              label="Upload image"
              showStatus={false}
              onUploaded={handleToolbarUpload}
              onUploadError={handleToolbarUploadError}
            />
          </div>
          <div className={styles.toolbarGroup} data-label="History" role="group" aria-label="History">
            <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 aria-hidden="true" /></ToolbarButton>
            <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 aria-hidden="true" /></ToolbarButton>
          </div>
      </div>

      <div className={styles.editorFrame}>
        <div className={styles.canvas}>
          <div className={styles.canvasHint}>Start writing below. Use H2 and H3 headings to structure the article.</div>
          <EditorContent editor={editor} />
        </div>
      </div>

      {mediaPanelOpen ? (
        <fieldset
          ref={mediaPanelRef}
          className={styles.imageInsert}
          id="article-media-composer"
          tabIndex={-1}
          onInput={(event) => event.stopPropagation()}
        >
          <legend><ImagePlus aria-hidden="true" /> Insert managed media</legend>
          <button className={styles.closeComposer} type="button" aria-label="Close media composer" onClick={closeMediaPanel}><X aria-hidden="true" /></button>
          {mediaNotice ? (
            <p className={styles.mediaNotice} data-tone={mediaNotice.tone} role={mediaNotice.tone === "error" ? "alert" : "status"}>
              {mediaNotice.message}
            </p>
          ) : null}
          <BlogEditorMediaUpload
            compact
            onUploaded={(asset) => {
              onMediaUploaded(asset);
              setSelectedAssetId(asset.id);
              setMediaNotice({ tone: "success", message: "Image uploaded. Add alt text or mark it decorative before inserting." });
            }}
            onUploadError={(message) => setMediaNotice({ tone: "error", message })}
          />
          {media.length ? (
            <>
              <AdminSelect
                className={styles.assetSelect}
                id="editor-media-asset"
                label="Media asset"
                value={resolvedSelectedAssetId}
                options={mediaOptions}
                size="compact"
                onValueChange={setSelectedAssetId}
              />
              {selectedAsset ? (
                <div className={styles.assetPreview}>
                  <Image
                    src={selectedAsset.url}
                    alt={`Preview of ${selectedAsset.label}`}
                    width={selectedAsset.width}
                    height={selectedAsset.height}
                    sizes="(max-width: 48rem) 100vw, 16rem"
                    unoptimized
                  />
                  <span>{selectedAsset.label}</span>
                </div>
              ) : null}
              <label htmlFor="editor-image-alt">
                <span>Alternative text</span>
                <input id="editor-image-alt" value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} disabled={decorative} maxLength={300} />
              </label>
              <label htmlFor="editor-image-caption">
                <span>Caption <em>Optional</em></span>
                <input id="editor-image-caption" value={imageCaption} onChange={(event) => setImageCaption(event.target.value)} maxLength={300} />
              </label>
              <label className={styles.decorativeChoice} htmlFor="editor-image-decorative">
                <input id="editor-image-decorative" type="checkbox" checked={decorative} onChange={(event) => setDecorative(event.target.checked)} />
                This image is decorative
              </label>
              <button className={styles.insertButton} type="button" disabled={!resolvedSelectedAssetId || (!decorative && !imageAlt.trim())} onClick={insertImage}>Insert image</button>
              <button className={styles.galleryButton} type="button" disabled={galleryItems.length >= 12 || !resolvedSelectedAssetId || (!decorative && !imageAlt.trim())} onClick={addGalleryItem}>
                <GalleryHorizontal aria-hidden="true" /> {galleryItems.length >= 12 ? "Gallery full (12)" : "Add to gallery"}
              </button>
              {galleryItems.length ? (
                <div className={styles.galleryQueue}>
                  <strong>Gallery queue ({galleryItems.length})</strong>
                  <ul>
                    {galleryItems.map((item, index) => (
                      <li key={`${item.assetId}-${index}`}>
                        <Image src={item.src} alt="" width={item.width} height={item.height} unoptimized />
                        <span>{item.alt || "Decorative image"}</span>
                        <button type="button" aria-label={`Remove gallery image ${index + 1}`} onClick={() => setGalleryItems((items) => items.filter((_, itemIndex) => itemIndex !== index))}><X aria-hidden="true" /></button>
                      </li>
                    ))}
                  </ul>
                  <button className={styles.insertButton} type="button" disabled={galleryItems.length < 2} onClick={insertGallery}>Insert gallery</button>
                </div>
              ) : null}
            </>
          ) : (
            <p className={styles.emptyMedia}>Upload an image to start building the article.</p>
          )}
        </fieldset>
      ) : null}

      {linkDialogOpen ? (
        <BlogEditorLinkDialog
          initialValue={initialLinkHref}
          onCancel={closeLinkDialog}
          onSubmit={applyLink}
        />
      ) : null}
    </div>
  );
}
