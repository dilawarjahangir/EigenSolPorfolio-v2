import "server-only";

import { createHash, randomUUID } from "node:crypto";
import {
  link,
  lstat,
  mkdir,
  open,
  readFile,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";
import type {
  BlogCmsActor,
  BlogMediaAsset,
  BlogMediaAssetInput,
} from "@/contracts/blog-cms";
import {
  BlogCmsConflictError,
  finalizeBlogMediaAssetPurge,
  getBlogMediaAssetByStorageKey,
  listPurgeableBlogMediaAssets,
  registerBlogMediaAsset,
} from "@/services/blog-posts/BlogPostService";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_SOURCE_DIMENSION = 6_000;
const MAX_OUTPUT_DIMENSION = 2_400;
const MAX_INPUT_PIXELS = MAX_SOURCE_DIMENSION * MAX_SOURCE_DIMENSION;
const MANAGED_MEDIA_KEY_PATTERN = /^[a-f0-9]{64}\.webp$/;

const supportedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

type SupportedMimeType = (typeof supportedMimeTypes)[number];

export type ManagedBlogMediaUpload = Readonly<{
  name: string;
  size: number;
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}>;

export type ManagedBlogMediaUploadResult = Readonly<{
  asset: BlogMediaAsset;
  duplicate: boolean;
}>;

export type ActiveManagedBlogMediaFile = Readonly<{
  asset: BlogMediaAsset;
  body: Uint8Array | null;
  byteSize: number;
  etag: string;
  lastModified: Date;
}>;

export type ManagedBlogMediaPurgeResult = Readonly<{
  selected: number;
  purged: number;
  missingFiles: number;
  skipped: number;
}>;

export type BlogMediaUploadErrorCode =
  | "empty-file"
  | "file-too-large"
  | "unsupported-media-type"
  | "invalid-file-signature"
  | "invalid-image"
  | "image-dimensions-too-large"
  | "media-conflict";

export class BlogMediaUploadError extends Error {
  constructor(
    public readonly code: BlogMediaUploadErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BlogMediaUploadError";
  }
}

type PreparedManagedMedia = Readonly<{
  bytes: Buffer;
  checksumSha256: string;
  storageKey: string;
  width: number;
  height: number;
}>;

function isNodeError(error: unknown, code: string) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}

function normalizeMimeType(value: string): SupportedMimeType | null {
  const normalized = value.trim().toLowerCase();
  return supportedMimeTypes.includes(normalized as SupportedMimeType)
    ? (normalized as SupportedMimeType)
    : null;
}

function hasJpegSignature(bytes: Buffer) {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

function hasPngSignature(bytes: Buffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return bytes.length >= signature.length && bytes.subarray(0, signature.length).equals(signature);
}

function hasWebpSignature(bytes: Buffer) {
  return (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  );
}

function hasAvifSignature(bytes: Buffer) {
  if (bytes.length < 16 || bytes.toString("ascii", 4, 8) !== "ftyp") return false;

  const boxSize = bytes.readUInt32BE(0);
  if (boxSize < 16 || boxSize > bytes.length) return false;

  for (let offset = 8; offset + 4 <= boxSize; offset += 4) {
    const brand = bytes.toString("ascii", offset, offset + 4);
    if (brand === "avif" || brand === "avis") return true;
  }

  return false;
}

function signatureMatchesMimeType(bytes: Buffer, mimeType: SupportedMimeType) {
  if (mimeType === "image/jpeg") return hasJpegSignature(bytes);
  if (mimeType === "image/png") return hasPngSignature(bytes);
  if (mimeType === "image/webp") return hasWebpSignature(bytes);
  return hasAvifSignature(bytes);
}

function metadataMatchesMimeType(metadata: Metadata, mimeType: SupportedMimeType) {
  if (mimeType === "image/jpeg") return metadata.format === "jpeg";
  if (mimeType === "image/png") return metadata.format === "png";
  if (mimeType === "image/webp") return metadata.format === "webp";
  return metadata.format === "heif" && metadata.compression === "av1";
}

function safeOriginalFilename(value: string) {
  const normalized = value.replaceAll("\\", "/");
  const basename = normalized.split("/").at(-1) ?? "upload";
  const sanitized = basename.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return (sanitized || "upload").slice(0, 255);
}

export function isManagedMediaStorageKey(value: string) {
  return MANAGED_MEDIA_KEY_PATTERN.test(value);
}

export function getBlogMediaRoot() {
  const configuredRoot = process.env.BLOG_MEDIA_ROOT?.trim();
  const defaultRoot =
    process.env.NODE_ENV === "production"
      ? "/es/shared/eigensol-media"
      : path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "blog-media");
  const resolvedRoot = path.resolve(
    /* turbopackIgnore: true */ configuredRoot || defaultRoot,
  );

  if (resolvedRoot === path.parse(resolvedRoot).root) {
    throw new Error("BLOG_MEDIA_ROOT must not be a filesystem root");
  }

  return resolvedRoot;
}

export function resolveManagedMediaPath(storageKey: string) {
  if (!isManagedMediaStorageKey(storageKey)) {
    throw new Error("Invalid managed media storage key");
  }

  const root = getBlogMediaRoot();
  const candidate = path.resolve(/* turbopackIgnore: true */ root, storageKey);
  const relative = path.relative(root, candidate);

  if (!relative || path.isAbsolute(relative) || relative.startsWith("..") || relative.includes(path.sep)) {
    throw new Error("Managed media path escaped its storage root");
  }

  return candidate;
}

async function validateImageMetadata(bytes: Buffer, mimeType: SupportedMimeType) {
  let metadata: Metadata;

  try {
    metadata = await sharp(bytes, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    }).metadata();
  } catch {
    throw new BlogMediaUploadError("invalid-image", "The uploaded file is not a valid image.");
  }

  if (!metadataMatchesMimeType(metadata, mimeType)) {
    throw new BlogMediaUploadError(
      "invalid-file-signature",
      "The image contents do not match its declared file type.",
    );
  }

  const { width, height } = metadata;
  if (!width || !height) {
    throw new BlogMediaUploadError("invalid-image", "The image dimensions could not be read.");
  }

  if (width > MAX_SOURCE_DIMENSION || height > MAX_SOURCE_DIMENSION) {
    throw new BlogMediaUploadError(
      "image-dimensions-too-large",
      "Images must be no larger than 6000 by 6000 pixels.",
    );
  }
}

export async function prepareManagedBlogMediaUpload(
  upload: ManagedBlogMediaUpload,
): Promise<PreparedManagedMedia> {
  if (!Number.isSafeInteger(upload.size) || upload.size <= 0) {
    throw new BlogMediaUploadError("empty-file", "Choose a non-empty image file.");
  }

  if (upload.size > MAX_UPLOAD_BYTES) {
    throw new BlogMediaUploadError("file-too-large", "Images must be 10 MB or smaller.");
  }

  const mimeType = normalizeMimeType(upload.type);
  if (!mimeType) {
    throw new BlogMediaUploadError(
      "unsupported-media-type",
      "Use a JPEG, PNG, WebP, or AVIF image.",
    );
  }

  const sourceBytes = Buffer.from(await upload.arrayBuffer());
  if (sourceBytes.byteLength !== upload.size || !signatureMatchesMimeType(sourceBytes, mimeType)) {
    throw new BlogMediaUploadError(
      "invalid-file-signature",
      "The image contents do not match its declared file type.",
    );
  }

  await validateImageMetadata(sourceBytes, mimeType);

  let output: { data: Buffer; info: { width: number; height: number } };
  try {
    output = await sharp(sourceBytes, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate()
      .resize({
        width: MAX_OUTPUT_DIMENSION,
        height: MAX_OUTPUT_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ effort: 4, quality: 82, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new BlogMediaUploadError("invalid-image", "The image could not be processed safely.");
  }

  const checksumSha256 = createHash("sha256").update(output.data).digest("hex");
  return {
    bytes: output.data,
    checksumSha256,
    storageKey: `${checksumSha256}.webp`,
    width: output.info.width,
    height: output.info.height,
  };
}

async function existingFileMatches(filePath: string, expectedChecksum: string) {
  const information = await lstat(filePath);
  if (!information.isFile() || information.isSymbolicLink()) return false;

  const checksum = createHash("sha256")
    .update(await readFile(/* turbopackIgnore: true */ filePath))
    .digest("hex");
  return checksum === expectedChecksum;
}

async function storePreparedManagedMedia(prepared: PreparedManagedMedia) {
  const root = getBlogMediaRoot();
  const destination = resolveManagedMediaPath(prepared.storageKey);
  const temporaryPath = path.join(root, `.upload-${randomUUID()}.tmp`);

  await mkdir(root, { recursive: true, mode: 0o750 });

  const temporaryFile = await open(temporaryPath, "wx", 0o640);
  try {
    try {
      await temporaryFile.writeFile(prepared.bytes);
      await temporaryFile.sync();
    } finally {
      await temporaryFile.close();
    }

    try {
      await link(temporaryPath, destination);
      return true;
    } catch (error) {
      if (!isNodeError(error, "EEXIST")) throw error;
      if (!(await existingFileMatches(destination, prepared.checksumSha256))) {
        throw new BlogMediaUploadError(
          "media-conflict",
          "A conflicting file already exists in managed storage.",
        );
      }
      return false;
    }
  } finally {
    await unlink(temporaryPath).catch((error: unknown) => {
      if (!isNodeError(error, "ENOENT")) throw error;
    });
  }
}

async function removeNewlyCreatedManagedMedia(storageKey: string) {
  const filePath = resolveManagedMediaPath(storageKey);

  try {
    const information = await lstat(filePath);
    if (!information.isFile() || information.isSymbolicLink()) {
      throw new Error("Managed media rollback encountered an unsafe file");
    }
    await unlink(filePath);
  } catch (error) {
    if (!isNodeError(error, "ENOENT")) throw error;
  }
}

function mediaAssetInput(
  upload: ManagedBlogMediaUpload,
  prepared: PreparedManagedMedia,
): BlogMediaAssetInput {
  return {
    storageKind: "managed",
    storageKey: prepared.storageKey,
    publicUrl: `/media/${prepared.storageKey}`,
    originalFilename: safeOriginalFilename(upload.name),
    mimeType: "image/webp",
    width: prepared.width,
    height: prepared.height,
    byteSize: prepared.bytes.byteLength,
    checksumSha256: prepared.checksumSha256,
  };
}

export async function uploadManagedBlogMedia(
  upload: ManagedBlogMediaUpload,
  actor: BlogCmsActor,
): Promise<ManagedBlogMediaUploadResult> {
  const prepared = await prepareManagedBlogMediaUpload(upload);
  const createdFile = await storePreparedManagedMedia(prepared);

  try {
    const asset = await registerBlogMediaAsset(mediaAssetInput(upload, prepared), actor);
    return { asset, duplicate: false };
  } catch (error) {
    if (error instanceof BlogCmsConflictError && error.code === "media-conflict") {
      const existingAsset = await getBlogMediaAssetByStorageKey(prepared.storageKey);
      if (existingAsset) return { asset: existingAsset, duplicate: true };
      if (createdFile) await removeNewlyCreatedManagedMedia(prepared.storageKey);
      throw new BlogMediaUploadError(
        "media-conflict",
        "This image already exists in the media trash.",
      );
    }

    if (createdFile) await removeNewlyCreatedManagedMedia(prepared.storageKey);
    throw error;
  }
}

export async function getActiveManagedBlogMediaFile(
  storageKey: string,
  includeBody: boolean,
): Promise<ActiveManagedBlogMediaFile | null> {
  if (!isManagedMediaStorageKey(storageKey)) return null;

  const asset = await getBlogMediaAssetByStorageKey(storageKey);
  const checksum = storageKey.slice(0, 64);
  if (
    !asset ||
    asset.storageKind !== "managed" ||
    asset.mimeType !== "image/webp" ||
    asset.checksumSha256 !== checksum
  ) {
    return null;
  }

  const filePath = resolveManagedMediaPath(storageKey);
  let information;
  try {
    information = await lstat(filePath);
  } catch (error) {
    if (isNodeError(error, "ENOENT")) return null;
    throw error;
  }

  if (!information.isFile() || information.isSymbolicLink()) return null;
  if (asset.byteSize !== null && asset.byteSize !== information.size) return null;

  return {
    asset,
    body: includeBody
      ? await readFile(/* turbopackIgnore: true */ filePath)
      : null,
    byteSize: information.size,
    etag: `"${checksum}"`,
    lastModified: information.mtime,
  };
}

async function removePurgeCandidateFile(storageKey: string) {
  if (!isManagedMediaStorageKey(storageKey)) return "unsafe" as const;

  const filePath = resolveManagedMediaPath(storageKey);
  try {
    const information = await lstat(filePath);
    if (!information.isFile() || information.isSymbolicLink()) return "unsafe" as const;
    await unlink(filePath);
    return "removed" as const;
  } catch (error) {
    if (isNodeError(error, "ENOENT")) return "missing" as const;
    throw error;
  }
}

export async function purgeExpiredManagedBlogMedia(
  options: Readonly<{
    now?: Date;
    retentionDays?: number;
    limit?: number;
  }> = {},
): Promise<ManagedBlogMediaPurgeResult> {
  const now = options.now ?? new Date();
  const retentionDays = options.retentionDays ?? 30;

  if (Number.isNaN(now.getTime())) throw new Error("Media purge time is invalid");
  if (!Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 3_650) {
    throw new Error("Media purge retention is invalid");
  }

  const trashedBefore = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1_000);
  const candidates = await listPurgeableBlogMediaAssets({
    trashedBefore,
    limit: options.limit,
  });
  let purged = 0;
  let missingFiles = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const fileResult = await removePurgeCandidateFile(candidate.storageKey);
    if (fileResult === "unsafe") {
      skipped += 1;
      continue;
    }

    const finalized = await finalizeBlogMediaAssetPurge({
      mediaId: candidate.id,
      storageKey: candidate.storageKey,
      trashedBefore,
    });
    if (!finalized) {
      skipped += 1;
      continue;
    }

    purged += 1;
    if (fileResult === "missing") missingFiles += 1;
  }

  return {
    selected: candidates.length,
    purged,
    missingFiles,
    skipped,
  };
}
