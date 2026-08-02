import { ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import adminStyles from "@/components/admin/AdminUi.module.css";
import {
  BlogCmsValidationError,
  listBlogMediaAssets,
} from "@/services/blog-posts/BlogPostService";
import { requireOwner } from "@/services/auth/AdminAuthService";
import { trashBlogMediaAction } from "./actions";
import styles from "./MediaPage.module.css";

type MediaAdminPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function mediaNotice(value: string | undefined) {
  if (value === "trashed") return "The unreferenced image was moved to trash.";
  if (value === "referenced") return "That image is retained by a post revision and cannot be trashed.";
  if (value === "not-found") return "That media asset no longer exists.";
  if (value === "invalid-request") return "The media request was invalid.";
  if (value === "invalid-cursor") return "That media page link was invalid. The first page is shown.";
  if (value === "failed") return "The media asset could not be changed. Try again.";
  return null;
}

function formatBytes(bytes: number | null) {
  if (bytes === null) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mediaHref(input: Readonly<{
  includeTrashed: boolean;
  cursor?: string;
  notice?: string;
}>) {
  const query = new URLSearchParams();
  if (input.includeTrashed) query.set("includeTrashed", "true");
  if (input.cursor) query.set("cursor", input.cursor);
  if (input.notice) query.set("notice", input.notice);
  const serialized = query.toString();
  return serialized ? `/admin/media?${serialized}` : "/admin/media";
}

export default async function MediaAdminPage({ searchParams }: MediaAdminPageProps) {
  await requireOwner();
  const params = await searchParams;
  const includeTrashed = firstValue(params.includeTrashed) === "true";
  const cursor = firstValue(params.cursor)?.slice(0, 512);
  const notice = mediaNotice(firstValue(params.notice));
  let page;
  try {
    page = await listBlogMediaAssets({ includeTrashed, cursor, limit: 24 });
  } catch (error) {
    if (cursor && error instanceof BlogCmsValidationError) {
      redirect(mediaHref({ includeTrashed, notice: "invalid-cursor" }));
    }
    throw error;
  }
  const returnTo = mediaHref({ includeTrashed });

  return (
    <div className={adminStyles.page}>
      <header className={adminStyles.pageHeader}>
        <div className={adminStyles.pageHeaderCopy}>
          <p className={adminStyles.eyebrow}>Managed assets</p>
          <h1 className={adminStyles.title}>Media library</h1>
          <p className={adminStyles.description}>
            Upload durable, content-addressed images and reuse them across blog revisions.
          </p>
        </div>
        <div className={adminStyles.actions}>
          <Link
            className={adminStyles.buttonSecondary}
            href={mediaHref({ includeTrashed: !includeTrashed })}
          >
            {includeTrashed ? "Hide trash" : "Show trash"}
          </Link>
        </div>
      </header>

      {notice ? <p className={adminStyles.notice} role="status">{notice}</p> : null}

      <MediaUploadForm />

      {page.assets.length ? (
        <>
          <section className={styles.grid} aria-label="Media assets">
            {page.assets.map((asset) => {
              const active = asset.trashedAt === null;
              const canPreview = active && asset.publicUrl.startsWith("/");

              return (
                <article className={styles.card} key={asset.id}>
                  <div className={styles.preview}>
                    {canPreview ? (
                      <Image
                        src={asset.publicUrl}
                        alt={`Preview of ${asset.originalFilename}`}
                        width={asset.width ?? 640}
                        height={asset.height ?? 420}
                        sizes="(max-width: 44rem) 100vw, (max-width: 72rem) 50vw, 25vw"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <span className={styles.placeholder}>
                        <ImageIcon aria-hidden="true" />
                        {active ? "Preview unavailable" : "In trash"}
                      </span>
                    )}
                    <span
                      className={adminStyles.badge}
                      data-tone={active ? "success" : "danger"}
                    >
                      {active ? asset.storageKind : "trashed"}
                    </span>
                  </div>

                  <div className={styles.details}>
                    <h2 title={asset.originalFilename}>{asset.originalFilename}</h2>
                    <dl>
                      <div>
                        <dt>Dimensions</dt>
                        <dd>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : "Unknown"}</dd>
                      </div>
                      <div>
                        <dt>File size</dt>
                        <dd>{formatBytes(asset.byteSize)}</dd>
                      </div>
                      <div>
                        <dt>Added</dt>
                        <dd>{dateFormatter.format(new Date(asset.createdAt))}</dd>
                      </div>
                    </dl>
                    <code className={styles.storageKey}>{asset.storageKey}</code>

                    {active ? (
                      <form action={trashBlogMediaAction}>
                        <input type="hidden" name="mediaId" value={asset.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <AdminConfirmButton
                          tone="danger"
                          pendingLabel="Moving to trash…"
                          confirmation="Move this image to trash? Images retained by a revision will be protected."
                        >
                          <Trash2 aria-hidden="true" />
                          Move to trash
                        </AdminConfirmButton>
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>

          <nav className={styles.pagination} aria-label="Media pagination">
            <span>Showing up to 24 assets</span>
            {page.nextCursor ? (
              <Link
                className={adminStyles.buttonSecondary}
                href={mediaHref({ includeTrashed, cursor: page.nextCursor })}
              >
                Next page
              </Link>
            ) : null}
          </nav>
        </>
      ) : (
        <section className={adminStyles.emptyState}>
          <ImageIcon aria-hidden="true" />
          <h2>{includeTrashed ? "No media assets found" : "Your media library is empty"}</h2>
          <p>Upload the first image above, or change the trash filter.</p>
        </section>
      )}
    </div>
  );
}
