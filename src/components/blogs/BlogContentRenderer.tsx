import type { JSONContent } from "@tiptap/core";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import Image from "next/image";
import type { BlogEditorDocument, BlogRevisionMedia } from "@/contracts/blog-cms";
import { blogContentExtensions } from "@/lib/blog-content-extensions";
import styles from "./BlogPages.module.css";

type BlogContentRendererProps = Readonly<{
  content: BlogEditorDocument["doc"];
  media: readonly BlogRevisionMedia[];
}>;

function positiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function renderManagedImage(
  item: Record<string, unknown>,
  media: readonly BlogRevisionMedia[],
  key?: React.Key,
) {
  const assetId = typeof item.assetId === "string" ? item.assetId : "";
  const reference = media.find(
    (reference) => reference.role === "body" && reference.mediaId === assetId,
  );
  const asset = reference?.asset;
  const src = asset?.publicUrl ?? "";
  const decorative = item.decorative === true;
  const alt = decorative ? "" : typeof item.alt === "string" ? item.alt : "";
  const caption = typeof item.caption === "string" ? item.caption : "";
  const width = positiveInteger(asset?.width, 1600);
  const height = positiveInteger(asset?.height, 900);

  if (!src) return null;

  return (
    <figure className={styles.managedArticleImage} key={key}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 1024px) 820px, calc(100vw - 48px)"
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function BlogContentRenderer({ content, media }: BlogContentRendererProps) {
  const rendered = renderToReactElement({
    // CMS documents are immutable after validation. The static renderer does
    // not mutate them, even though Tiptap's public JSON type is mutable.
    content: content as JSONContent,
    extensions: blogContentExtensions,
    options: {
      nodeMapping: {
        image: ({ node }) => renderManagedImage(node.attrs, media),
        managedGallery: ({ node }) => {
          const items = Array.isArray(node.attrs.items) ? node.attrs.items : [];

          return (
            <div className={styles.managedArticleGallery}>
              {items.map((item, index) =>
                item && typeof item === "object"
                  ? renderManagedImage(
                      item as Record<string, unknown>,
                      media,
                      `${String((item as Record<string, unknown>).assetId ?? "image")}-${index}`,
                    )
                  : null,
              )}
            </div>
          );
        },
      },
      unhandledNode: ({ children }) => children,
      unhandledMark: ({ children }) => children,
    },
  });

  return <div className={styles.renderedContent}>{rendered}</div>;
}
