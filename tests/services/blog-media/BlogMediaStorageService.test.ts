// @vitest-environment node

import path from "node:path";
import os from "node:os";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/services/blog-posts/BlogPostService", () => ({
  BlogCmsConflictError: class BlogCmsConflictError extends Error {
    constructor(
      message: string,
      public readonly code: string,
    ) {
      super(message);
    }
  },
  finalizeBlogMediaAssetPurge: vi.fn(),
  getBlogMediaAssetByStorageKey: vi.fn(),
  listPurgeableBlogMediaAssets: vi.fn(),
  registerBlogMediaAsset: vi.fn(),
}));

import {
  isManagedMediaStorageKey,
  prepareManagedBlogMediaUpload,
  purgeExpiredManagedBlogMedia,
  resolveManagedMediaPath,
  uploadManagedBlogMedia,
  type ManagedBlogMediaUpload,
} from "@/services/blog-media/BlogMediaStorageService";
import {
  finalizeBlogMediaAssetPurge,
  listPurgeableBlogMediaAssets,
  registerBlogMediaAsset,
} from "@/services/blog-posts/BlogPostService";

function upload(bytes: Buffer, type: string, name = "sample.png"): ManagedBlogMediaUpload {
  return {
    name,
    size: bytes.byteLength,
    type,
    async arrayBuffer() {
      const copy = Uint8Array.from(bytes);
      return copy.buffer;
    },
  };
}

afterEach(() => {
  delete process.env.BLOG_MEDIA_ROOT;
});

describe("managed media paths", () => {
  it("accepts only lowercase SHA-256 WebP storage keys", () => {
    expect(isManagedMediaStorageKey(`${"a".repeat(64)}.webp`)).toBe(true);
    expect(isManagedMediaStorageKey("../secret.webp")).toBe(false);
    expect(isManagedMediaStorageKey(`${"A".repeat(64)}.webp`)).toBe(false);
    expect(isManagedMediaStorageKey(`${"a".repeat(64)}.png`)).toBe(false);
  });

  it("keeps resolved files inside the configured media root", () => {
    const root = path.resolve(".data", "media-test-root");
    process.env.BLOG_MEDIA_ROOT = root;
    const key = `${"b".repeat(64)}.webp`;

    expect(resolveManagedMediaPath(key)).toBe(path.join(root, key));
    expect(() => resolveManagedMediaPath("../outside.webp")).toThrow(
      "Invalid managed media storage key",
    );
  });
});

describe("managed media processing", () => {
  it("converts a valid image to a bounded content-addressed WebP", async () => {
    const source = await sharp({
      create: {
        width: 3_000,
        height: 1_500,
        channels: 3,
        background: { r: 25, g: 90, b: 150 },
      },
    })
      .png()
      .toBuffer();

    const prepared = await prepareManagedBlogMediaUpload(upload(source, "image/png"));
    const metadata = await sharp(prepared.bytes).metadata();

    expect(prepared.storageKey).toMatch(/^[a-f0-9]{64}\.webp$/);
    expect(prepared.checksumSha256).toBe(prepared.storageKey.slice(0, 64));
    expect(metadata.format).toBe("webp");
    expect(prepared.width).toBe(2_400);
    expect(prepared.height).toBe(1_200);
  });

  it("strips source EXIF metadata from processed images", async () => {
    const source = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 3,
        background: { r: 25, g: 90, b: 150 },
      },
    })
      .jpeg()
      .withExif({ IFD0: { Artist: "Private metadata" } })
      .toBuffer();

    expect((await sharp(source).metadata()).exif).toBeDefined();
    const prepared = await prepareManagedBlogMediaUpload(upload(source, "image/jpeg"));
    expect((await sharp(prepared.bytes).metadata()).exif).toBeUndefined();
  });

  it("accepts AVIF only through Sharp's AV1 HEIF decoder", async () => {
    const source = await sharp({
      create: {
        width: 12,
        height: 12,
        channels: 3,
        background: { r: 25, g: 90, b: 150 },
      },
    })
      .avif({ effort: 0 })
      .toBuffer();

    expect((await sharp(source).metadata()).compression).toBe("av1");
    const prepared = await prepareManagedBlogMediaUpload(upload(source, "image/avif", "sample.avif"));
    expect((await sharp(prepared.bytes).metadata()).format).toBe("webp");
  });

  it("rejects a declared MIME type that does not match the file signature", async () => {
    const source = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    await expect(prepareManagedBlogMediaUpload(upload(source, "image/jpeg"))).rejects.toMatchObject({
      code: "invalid-file-signature",
    });
  });

  it("rejects dimensions above the 6000-pixel edge limit", async () => {
    const source = await sharp({
      create: {
        width: 6_001,
        height: 1,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();

    await expect(prepareManagedBlogMediaUpload(upload(source, "image/png"))).rejects.toMatchObject({
      code: "image-dimensions-too-large",
    });
  });

  it("rejects file sizes above 10 MB before reading the body", async () => {
    const arrayBuffer = vi.fn(async () => new ArrayBuffer(0));
    const oversized: ManagedBlogMediaUpload = {
      name: "large.jpg",
      size: 10 * 1024 * 1024 + 1,
      type: "image/jpeg",
      arrayBuffer,
    };

    await expect(prepareManagedBlogMediaUpload(oversized)).rejects.toMatchObject({
      code: "file-too-large",
    });
    expect(arrayBuffer).not.toHaveBeenCalled();
  });

  it("removes a newly created file when database registration fails", async () => {
    const mediaRoot = await mkdtemp(path.join(os.tmpdir(), "eigensol-media-test-"));
    process.env.BLOG_MEDIA_ROOT = mediaRoot;
    const source = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .png()
      .toBuffer();
    vi.mocked(registerBlogMediaAsset).mockRejectedValueOnce(new Error("database unavailable"));

    try {
      await expect(
        uploadManagedBlogMedia(upload(source, "image/png"), { id: "owner-id" }),
      ).rejects.toThrow("database unavailable");
      expect(await readdir(mediaRoot)).toEqual([]);
    } finally {
      await rm(mediaRoot, { recursive: true, force: true });
    }
  });

  it("physically purges only DB-approved managed assets after the retention window", async () => {
    const mediaRoot = await mkdtemp(path.join(os.tmpdir(), "eigensol-media-purge-test-"));
    process.env.BLOG_MEDIA_ROOT = mediaRoot;
    const storageKey = `${"c".repeat(64)}.webp`;
    await writeFile(resolveManagedMediaPath(storageKey), Uint8Array.from([1, 2, 3]));
    vi.mocked(listPurgeableBlogMediaAssets).mockResolvedValueOnce([
      {
        id: "00000000-0000-4000-8000-000000000001",
        storageKey,
        trashedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        storageKey: "../outside.webp",
        trashedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    vi.mocked(finalizeBlogMediaAssetPurge).mockResolvedValueOnce(true);

    try {
      const result = await purgeExpiredManagedBlogMedia({
        now: new Date("2026-02-01T00:00:00.000Z"),
      });

      expect(result).toEqual({ selected: 2, purged: 1, missingFiles: 0, skipped: 1 });
      expect(await readdir(mediaRoot)).toEqual([]);
      expect(finalizeBlogMediaAssetPurge).toHaveBeenCalledOnce();
      expect(finalizeBlogMediaAssetPurge).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaId: "00000000-0000-4000-8000-000000000001",
          storageKey,
          trashedBefore: new Date("2026-01-02T00:00:00.000Z"),
        }),
      );
    } finally {
      await rm(mediaRoot, { recursive: true, force: true });
    }
  });
});
