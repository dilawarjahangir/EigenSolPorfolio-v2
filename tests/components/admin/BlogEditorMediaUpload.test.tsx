// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlogEditorMediaUpload } from "@/components/admin/BlogEditorMediaUpload";

const asset = {
  id: "asset-1",
  storageKind: "managed" as const,
  storageKey: "abc.webp",
  publicUrl: "/media/abc.webp",
  originalFilename: "cover.png",
  mimeType: "image/webp",
  width: 1200,
  height: 630,
  byteSize: 1234,
  checksumSha256: "abc",
  createdAt: "2026-08-02T00:00:00.000Z",
  createdBy: "owner-1",
  trashedAt: null,
};

describe("BlogEditorMediaUpload", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("uploads an image through the protected media route and returns the asset", async () => {
    const user = userEvent.setup();
    const onUploaded = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ ok: true, asset, duplicate: false }),
      { status: 201, headers: { "content-type": "application/json" } },
    ));
    render(<BlogEditorMediaUpload onUploaded={onUploaded} />);

    await user.upload(
      screen.getByLabelText("Choose image to upload"),
      new File(["image"], "cover.png", { type: "image/png" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent("ready to use");
    expect(onUploaded).toHaveBeenCalledWith(asset);
    expect(fetch).toHaveBeenCalledWith("/api/admin/media", expect.objectContaining({
      method: "POST",
      credentials: "same-origin",
    }));
  });

  it("can render as an icon-only toolbar upload control", async () => {
    const user = userEvent.setup();
    const onUploaded = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ ok: true, asset, duplicate: false }),
      { status: 201, headers: { "content-type": "application/json" } },
    ));
    render(
      <BlogEditorMediaUpload
        buttonClassName="toolbar-upload"
        iconOnly
        label="Upload image from toolbar"
        showStatus={false}
        onUploaded={onUploaded}
      />,
    );

    expect(screen.getByRole("button", { name: "Upload image from toolbar" })).toHaveClass("toolbar-upload");
    await user.upload(
      screen.getByLabelText("Choose image to upload"),
      new File(["image"], "toolbar.png", { type: "image/png" }),
    );

    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(asset));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("reports hidden toolbar upload errors to the parent editor", async () => {
    const user = userEvent.setup();
    const onUploaded = vi.fn();
    const onUploadError = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ error: { message: "Use a JPEG, PNG, WebP, or AVIF image." } }),
      { status: 400, headers: { "content-type": "application/json" } },
    ));
    render(
      <BlogEditorMediaUpload
        iconOnly
        label="Upload image from toolbar"
        showStatus={false}
        onUploaded={onUploaded}
        onUploadError={onUploadError}
      />,
    );

    await user.upload(
      screen.getByLabelText("Choose image to upload"),
      new File(["image"], "broken.png", { type: "image/png" }),
    );

    await waitFor(() => expect(onUploadError).toHaveBeenCalledWith("Use a JPEG, PNG, WebP, or AVIF image."));
    expect(onUploaded).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
