// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadRouteMocks = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  uploadManagedBlogMedia: vi.fn(),
}));

vi.mock("@/services/auth/AdminAuthService", () => ({
  requireOwner: uploadRouteMocks.requireOwner,
}));
vi.mock("@/services/blog-media/BlogMediaStorageService", () => ({
  BlogMediaUploadError: class BlogMediaUploadError extends Error {
    constructor(
      public readonly code: string,
      message: string,
    ) {
      super(message);
    }
  },
  uploadManagedBlogMedia: uploadRouteMocks.uploadManagedBlogMedia,
}));

import { POST } from "@/app/api/admin/media/route";

beforeEach(() => {
  uploadRouteMocks.requireOwner.mockReset();
  uploadRouteMocks.requireOwner.mockResolvedValue({
    userId: "owner-id",
    email: "owner@example.com",
    name: "Owner",
  });
  uploadRouteMocks.uploadManagedBlogMedia.mockReset();
});

describe("admin media upload route", () => {
  it("authorizes independently and passes the authenticated actor to the media service", async () => {
    const checksum = "a".repeat(64);
    const asset = {
      id: "00000000-0000-4000-8000-000000000001",
      storageKind: "managed",
      storageKey: `${checksum}.webp`,
      publicUrl: `/media/${checksum}.webp`,
      originalFilename: "sample.png",
      mimeType: "image/webp",
      width: 10,
      height: 10,
      byteSize: 4,
      checksumSha256: checksum,
      createdAt: "2026-01-01T00:00:00.000Z",
      createdBy: "owner-id",
      trashedAt: null,
    };
    uploadRouteMocks.uploadManagedBlogMedia.mockResolvedValue({ asset, duplicate: false });
    const formData = new FormData();
    formData.set("file", new Blob([Uint8Array.from([1, 2, 3, 4])], { type: "image/png" }), "sample.png");

    const response = await POST(
      new Request("https://eigensol.com/api/admin/media", { method: "POST", body: formData }),
    );

    expect(uploadRouteMocks.requireOwner).toHaveBeenCalledOnce();
    expect(uploadRouteMocks.uploadManagedBlogMedia).toHaveBeenCalledWith(
      expect.objectContaining({ name: "sample.png", type: "image/png" }),
      { id: "owner-id" },
    );
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
  });

  it("authorizes before rejecting a non-multipart request", async () => {
    const response = await POST(
      new Request("https://eigensol.com/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );

    expect(uploadRouteMocks.requireOwner).toHaveBeenCalledOnce();
    expect(uploadRouteMocks.uploadManagedBlogMedia).not.toHaveBeenCalled();
    expect(response.status).toBe(415);
  });
});
