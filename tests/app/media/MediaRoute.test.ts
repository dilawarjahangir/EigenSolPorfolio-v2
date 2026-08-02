// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mediaMocks = vi.hoisted(() => ({
  getActiveFile: vi.fn(),
}));

vi.mock("@/services/blog-media/BlogMediaStorageService", () => ({
  getActiveManagedBlogMediaFile: mediaMocks.getActiveFile,
}));

import { GET, HEAD } from "@/app/media/[key]/route";

const checksum = "a".repeat(64);
const key = `${checksum}.webp`;
const context = { params: Promise.resolve({ key }) };
const file = {
  asset: {
    id: "00000000-0000-4000-8000-000000000001",
    storageKind: "managed",
    storageKey: key,
    publicUrl: `/media/${key}`,
    originalFilename: "example.png",
    mimeType: "image/webp",
    width: 10,
    height: 10,
    byteSize: 4,
    checksumSha256: checksum,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: "owner",
    trashedAt: null,
  },
  body: Uint8Array.from([1, 2, 3, 4]),
  byteSize: 4,
  etag: `"${checksum}"`,
  lastModified: new Date("2026-01-01T00:00:00.000Z"),
};

beforeEach(() => {
  mediaMocks.getActiveFile.mockReset();
});

describe("managed media route", () => {
  it("serves active WebP bytes with immutable and nosniff headers", async () => {
    mediaMocks.getActiveFile.mockResolvedValue(file);

    const response = await GET(new Request(`https://eigensol.com/media/${key}`), context);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("etag")).toBe(file.etag);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(file.body);
    expect(mediaMocks.getActiveFile).toHaveBeenCalledWith(key, true);
  });

  it("returns 304 when a weak conditional entity tag matches", async () => {
    mediaMocks.getActiveFile.mockResolvedValue(file);
    const request = new Request(`https://eigensol.com/media/${key}`, {
      headers: { "If-None-Match": `W/${file.etag}` },
    });

    const response = await GET(request, context);

    expect(response.status).toBe(304);
    expect(response.headers.get("content-length")).toBeNull();
    expect(await response.text()).toBe("");
  });

  it("handles HEAD without reading a response body", async () => {
    mediaMocks.getActiveFile.mockResolvedValue({ ...file, body: null });

    const response = await HEAD(new Request(`https://eigensol.com/media/${key}`), context);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-length")).toBe("4");
    expect(await response.text()).toBe("");
    expect(mediaMocks.getActiveFile).toHaveBeenCalledWith(key, false);
  });

  it("does not cache missing or inactive assets", async () => {
    mediaMocks.getActiveFile.mockResolvedValue(null);

    const response = await GET(new Request(`https://eigensol.com/media/${key}`), context);

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
  });
});
