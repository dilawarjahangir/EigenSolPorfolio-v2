// @vitest-environment jsdom

import type { JSONContent } from "@tiptap/core";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlogMediaAsset } from "@/contracts/blog-cms";

const editorMocks = vi.hoisted(() => {
  const setImage = vi.fn();
  const insertContent = vi.fn();
  const chain = {} as Record<string, ReturnType<typeof vi.fn>>;
  const chainMethod = (implementation?: (...args: unknown[]) => unknown) =>
    vi.fn((...args: unknown[]) => {
      implementation?.(...args);
      return chain;
    });

  Object.assign(chain, {
    focus: chainMethod(),
    setParagraph: chainMethod(),
    toggleHeading: chainMethod(),
    toggleBold: chainMethod(),
    toggleItalic: chainMethod(),
    toggleStrike: chainMethod(),
    toggleCode: chainMethod(),
    toggleBulletList: chainMethod(),
    toggleOrderedList: chainMethod(),
    toggleBlockquote: chainMethod(),
    toggleCodeBlock: chainMethod(),
    setHorizontalRule: chainMethod(),
    extendMarkRange: chainMethod(),
    setLink: chainMethod(),
    unsetLink: chainMethod(),
    setImage: chainMethod((value) => setImage(value)),
    insertContent: chainMethod((value) => insertContent(value)),
    undo: chainMethod(),
    redo: chainMethod(),
    run: vi.fn(() => true),
  });

  return {
    chain,
    setImage,
    insertContent,
    editor: {
      chain: () => chain,
      can: () => ({ undo: () => true, redo: () => true }),
      commands: { setImage: vi.fn() },
      getAttributes: vi.fn(() => ({})),
      getJSON: vi.fn(() => ({ type: "doc", content: [{ type: "paragraph" }] })),
      isActive: vi.fn((name: string) => name === "paragraph"),
    },
  };
});

vi.mock("@tiptap/react", () => ({
  EditorContent: () => <div role="textbox" aria-label="Article content" />,
  useEditor: () => editorMocks.editor,
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) => {
    // Next-only prop should not be forwarded to the mocked DOM element.
    const { unoptimized, ...imageProps } = props;
    void unoptimized;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt ?? ""} {...imageProps} />
    );
  },
}));

import { BlogContentEditor, type BlogEditorMediaOption } from "@/components/admin/BlogContentEditor";

const uploadedAsset: BlogMediaAsset = {
  id: "asset-uploaded",
  storageKind: "managed",
  storageKey: "uploaded.webp",
  publicUrl: "/media/uploaded.webp",
  originalFilename: "toolbar.png",
  mimeType: "image/webp",
  width: 1200,
  height: 630,
  byteSize: 1234,
  checksumSha256: "abc",
  createdAt: "2026-08-02T00:00:00.000Z",
  createdBy: "owner-1",
  trashedAt: null,
};

function Harness() {
  const [media, setMedia] = useState<readonly BlogEditorMediaOption[]>([]);

  return (
    <BlogContentEditor
      initialContent={{ type: "doc", content: [{ type: "paragraph" }] } satisfies JSONContent}
      media={media}
      onChange={vi.fn()}
      onMediaUploaded={(asset) => {
        setMedia((current) => [
          {
            id: asset.id,
            url: asset.publicUrl,
            label: asset.originalFilename,
            width: asset.width ?? 1600,
            height: asset.height ?? 900,
          },
          ...current,
        ]);
      }}
    />
  );
}

describe("BlogContentEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ ok: true, asset: uploadedAsset, duplicate: false }),
      { status: 201, headers: { "content-type": "application/json" } },
    ));
  });

  it("uploads from the toolbar, opens the media composer, and inserts accessible image media", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.upload(
      screen.getByLabelText("Choose image to upload"),
      new File(["image"], "toolbar.png", { type: "image/png" }),
    );

    const composer = await screen.findByRole("group", { name: /Insert managed media/ });
    expect(within(composer).getByRole("status")).toHaveTextContent("Image uploaded");
    expect(within(composer).getByRole("combobox", { name: "Media asset" })).toHaveTextContent("toolbar.png");
    expect(within(composer).getByRole("button", { name: "Insert image" })).toBeDisabled();

    await user.type(
      within(composer).getByRole("textbox", { name: "Alternative text" }),
      "Team reviewing an engineering dashboard",
    );
    await user.click(within(composer).getByRole("button", { name: "Insert image" }));

    await waitFor(() => expect(editorMocks.setImage).toHaveBeenCalledWith(expect.objectContaining({
      assetId: "asset-uploaded",
      alt: "Team reviewing an engineering dashboard",
      src: "/media/uploaded.webp",
    })));
  });
});
