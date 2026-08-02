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
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Unlink,
  X,
} from "lucide-react";
import { useState } from "react";
import { blogContentExtensions } from "@/lib/blog-content-extensions";
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
  onSaveShortcut?: () => void;
}>;

type ToolbarButtonProps = Readonly<{
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}>;

function ToolbarButton({ label, active = false, disabled = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      className={styles.toolbarButton}
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      data-active={active ? "true" : "false"}
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
  onSaveShortcut,
}: BlogContentEditorProps) {
  const [selectedAssetId, setSelectedAssetId] = useState(media[0]?.id ?? "");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [decorative, setDecorative] = useState(false);
  const [galleryItems, setGalleryItems] = useState<readonly GalleryItem[]>([]);

  const editor = useEditor({
    extensions: blogContentExtensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: styles.editorSurface,
        "aria-label": "Article content",
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

  if (!editor) {
    return <div className={styles.loading} role="status">Loading editor…</div>;
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL", previous ?? "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  const selectedImageAttributes = (): GalleryItem | null => {
    const asset = media.find((candidate) => candidate.id === selectedAssetId);
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

    editor
      .chain()
      .focus()
      .setImage({
        ...imageAttributes,
        title: imageAttributes.caption,
      } as Parameters<typeof editor.commands.setImage>[0])
      .run();
    resetImageFields();
  };

  const addGalleryItem = () => {
    const imageAttributes = selectedImageAttributes();
    if (!imageAttributes) return;

    setGalleryItems((items) => [...items, imageAttributes]);
    resetImageFields();
  };

  const insertGallery = () => {
    if (galleryItems.length < 2) return;
    editor
      .chain()
      .focus()
      .insertContent({ type: "managedGallery", attrs: { items: galleryItems } })
      .run();
    setGalleryItems([]);
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar} role="toolbar" aria-label="Article formatting">
        <ToolbarButton
          label="Heading level 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading level 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Braces aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Add or edit link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Remove link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 aria-hidden="true" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <fieldset className={styles.imageInsert}>
        <legend>
          <ImagePlus aria-hidden="true" />
          Insert managed image
        </legend>
        {media.length ? (
          <>
            <label>
              <span>Media asset</span>
              <select value={selectedAssetId} onChange={(event) => setSelectedAssetId(event.target.value)}>
                {media.map((asset) => (
                  <option value={asset.id} key={asset.id}>{asset.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Alternative text</span>
              <input
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                disabled={decorative}
                required={!decorative}
                maxLength={300}
              />
            </label>
            <label>
              <span>Caption (optional)</span>
              <input
                value={imageCaption}
                onChange={(event) => setImageCaption(event.target.value)}
                maxLength={300}
              />
            </label>
            <label className={styles.decorativeChoice}>
              <input
                type="checkbox"
                checked={decorative}
                onChange={(event) => setDecorative(event.target.checked)}
              />
              This image is decorative
            </label>
            <button
              className={styles.insertButton}
              type="button"
              disabled={!selectedAssetId || (!decorative && !imageAlt.trim())}
              onClick={insertImage}
            >
              Insert image
            </button>
            <button
              className={styles.galleryButton}
              type="button"
              disabled={!selectedAssetId || (!decorative && !imageAlt.trim())}
              onClick={addGalleryItem}
            >
              <GalleryHorizontal aria-hidden="true" />
              Add to gallery
            </button>
            {galleryItems.length ? (
              <div className={styles.galleryQueue}>
                <strong>Gallery images ({galleryItems.length})</strong>
                <ul>
                  {galleryItems.map((item, index) => (
                    <li key={`${item.assetId}-${index}`}>
                      <span>{item.alt || "Decorative image"}</span>
                      <button
                        type="button"
                        aria-label={`Remove gallery image ${index + 1}`}
                        onClick={() =>
                          setGalleryItems((items) => items.filter((_, itemIndex) => itemIndex !== index))
                        }
                      >
                        <X aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  className={styles.insertButton}
                  type="button"
                  disabled={galleryItems.length < 2}
                  onClick={insertGallery}
                >
                  Insert gallery
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p>Upload an image in Media before inserting it into the article.</p>
        )}
      </fieldset>
    </div>
  );
}
