// @vitest-environment jsdom

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminPostActionState } from "@/contracts/admin-actions";
import type { BlogPostAdminRecord } from "@/contracts/blog-cms";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  saveAction: vi.fn(async (): Promise<AdminPostActionState> => ({ status: "idle" })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
vi.mock("@/app/admin/(protected)/posts/actions", () => ({
  saveBlogPostAction: mocks.saveAction,
}));
vi.mock("next/dynamic", () => ({
  default: () => function EditorStub({
    onChange,
    onSaveShortcut,
  }: Readonly<{
    onChange: (value: object) => void;
    onSaveShortcut: () => void;
  }>) {
    return (
      <div aria-label="Editor stub">
        <button
          type="button"
          onClick={() => onChange({
            type: "doc",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Three useful words" }] }],
          })}
        >
          Change body
        </button>
        <button type="button" onClick={onSaveShortcut}>Save shortcut</button>
      </div>
    );
  },
}));

import type { BlogMediaAsset } from "@/contracts/blog-cms";
import { BlogPostEditorForm } from "@/components/admin/BlogPostEditorForm";

const coverAsset: BlogMediaAsset = {
  id: "asset-cover",
  storageKind: "managed",
  storageKey: "cover.webp",
  publicUrl: "/media/cover.webp",
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

const secondCoverAsset: BlogMediaAsset = {
  ...coverAsset,
  id: "asset-second-cover",
  storageKey: "second-cover.webp",
  publicUrl: "/media/second-cover.webp",
  originalFilename: "second-cover.png",
  checksumSha256: "def",
};

const existingPost: BlogPostAdminRecord = {
  id: "post-1",
  slug: "existing-post",
  status: "draft",
  version: 2,
  currentRevisionId: "revision-2",
  publishedRevisionId: null,
  firstPublishedAt: null,
  contentModifiedAt: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-02T00:00:00.000Z",
  archivedAt: null,
  activeSchedule: null,
  currentRevision: {
    id: "revision-2",
    postId: "post-1",
    slug: "existing-post",
    revisionNumber: 2,
    title: "Existing post",
    excerpt: "An existing draft excerpt.",
    category: "Engineering",
    content: {
      schemaVersion: 1,
      doc: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Saved body" }] }],
      },
    },
    tags: [],
    author: "EigenSol Engineering",
    authorRole: "Engineering Team",
    authorBio: "",
    videoId: null,
    seoTitle: null,
    seoDescription: null,
    readTimeMinutes: 1,
    media: [],
    createdAt: "2026-08-02T00:00:00.000Z",
    createdBy: "owner-1",
  },
};

describe("BlogPostEditorForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveAction.mockReset();
    mocks.saveAction.mockResolvedValue({ status: "idle" });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("generates a slug until the URL is deliberately edited", async () => {
    const user = userEvent.setup();
    render(<BlogPostEditorForm post={null} media={[]} />);

    const title = screen.getByRole("textbox", { name: "Article title" });
    await user.type(title, "Building Reliable APIs");
    expect(screen.getByText("eigensol.com/blogs/building-reliable-apis")).toBeInTheDocument();
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "SEO" }));
    const slug = screen.getByRole("textbox", { name: "Article URL" });
    expect(slug).toHaveValue("building-reliable-apis");
    await user.clear(slug);
    await user.type(slug, "platform-notes");
    await user.click(screen.getByRole("tab", { name: "Write" }));
    await user.type(title, " Today");
    expect(slug).toHaveValue("platform-notes");
  });

  it("keeps every workflow field mounted and preserves submit intent names", async () => {
    const user = userEvent.setup();
    render(<BlogPostEditorForm post={null} media={[]} />);

    const save = screen.getByRole("button", { name: "Save draft" });
    const publish = screen.getByRole("button", { name: "Publish now" });
    const schedule = screen.getByRole("button", { name: "Schedule publication" });
    expect(save).toHaveAttribute("name", "intent");
    expect(save).toHaveAttribute("value", "save");
    expect(schedule).toHaveAttribute("value", "schedule");
    expect(publish).toHaveAttribute("value", "publish");
    expect(save).toBeEnabled();
    expect(publish).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "Article title" }), "Draft title");
    await user.click(screen.getByRole("tab", { name: "SEO" }));
    await user.type(screen.getByRole("textbox", { name: /^SEO title/ }), "Custom search title");

    const form = save.closest("form");
    expect(form).not.toBeNull();
    const formData = new FormData(form!);
    expect(formData.get("slug")).toBe("draft-title");
    expect(formData.get("seoTitle")).toBe("Custom search title");
    expect(formData.get("author")).toBe("EigenSol Engineering");
    expect(formData.get("contentDocument")).toContain('"type":"doc"');
  });

  it("enables publishing only after an accessible cover is assigned", async () => {
    const user = userEvent.setup();
    render(<BlogPostEditorForm post={null} media={[coverAsset, secondCoverAsset]} />);
    const publish = screen.getByRole("button", { name: "Publish now" });
    expect(publish).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Article title" }), "A publishable article");
    await user.type(
      screen.getByRole("textbox", { name: /^Excerpt/ }),
      "A complete excerpt that is ready for publication.",
    );
    await user.type(screen.getByRole("textbox", { name: /^Category/ }), "Engineering");
    await user.click(screen.getByRole("button", { name: "Change body" }));

    await user.click(screen.getByRole("tab", { name: /Media/ }));
    const coverSelect = screen.getAllByRole("combobox", { name: "Asset" })[0];
    await user.click(coverSelect);
    await user.click(screen.getByRole("option", { name: /^cover\.png/ }));
    const coverField = coverSelect.closest("fieldset");
    expect(coverField).not.toBeNull();
    const alternativeText = within(coverField!).getByRole("textbox", { name: "Alternative text" });
    await user.type(alternativeText, "Engineers reviewing a platform diagram");

    await waitFor(() => expect(publish).toBeEnabled());
    const form = publish.closest("form");
    expect(new FormData(form!).get("coverMediaId")).toBe("asset-cover");

    const heroField = screen.getByRole("group", { name: "Hero image" });
    const heroSelect = within(heroField).getByRole("combobox", { name: "Asset" });
    await user.click(heroSelect);
    await user.click(within(heroField).getByRole("option", { name: /^cover\.png/ }));
    expect(publish).toBeDisabled();
    await user.type(
      within(heroField).getByRole("textbox", { name: "Alternative text" }),
      "A detailed article hero",
    );
    await waitFor(() => expect(publish).toBeEnabled());

    await user.click(coverSelect);
    await user.click(screen.getByRole("option", { name: /second-cover\.png/ }));
    expect(alternativeText).toHaveValue("");
    expect(publish).toBeDisabled();
  }, 15_000);

  it("traps focus in compact settings and closes the drawer with Escape", async () => {
    const user = userEvent.setup();
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    render(<BlogPostEditorForm post={null} media={[]} />);

    const settingsButton = screen.getByRole("button", { name: /^Settings$/ });
    await user.click(settingsButton);
    const dialog = await screen.findByRole("dialog", { name: "Post settings" });
    expect(dialog).toBeInTheDocument();
    const closeButton = screen.getAllByRole("button", { name: "Close post settings" }).at(-1)!;
    await waitFor(() => expect(closeButton).toHaveFocus());
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    const authorSummary = screen.getByText("Author profile").closest("summary");
    expect(authorSummary).not.toBeNull();
    await user.click(authorSummary!);
    closeButton.focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(authorSummary).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Post settings" })).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe("");
    expect(settingsButton).toHaveFocus();
  });

  it("keeps an assigned asset available when it is outside the latest media page", async () => {
    const user = userEvent.setup();
    const postWithAssignedCover: BlogPostAdminRecord = {
      ...existingPost,
      currentRevision: {
        ...existingPost.currentRevision,
        media: [{
          mediaId: coverAsset.id,
          role: "cover",
          position: 0,
          altText: "A retained cover image",
          decorative: false,
          caption: null,
          asset: coverAsset,
        }],
      },
    };
    render(<BlogPostEditorForm post={postWithAssignedCover} media={[]} />);

    await user.click(screen.getByRole("tab", { name: /Media/ }));
    const coverField = screen.getByRole("group", { name: "Cover image" });
    expect(within(coverField).getByRole("img", { name: "Preview of cover.png" })).toBeInTheDocument();
    expect(within(coverField).getByRole("combobox", { name: "Asset" })).toHaveTextContent("cover.png");
    await waitFor(() => expect(screen.getByRole("button", { name: "Publish now" })).toBeEnabled());
  });

  it("closes compact settings before focusing a main-editor validation error", async () => {
    const user = userEvent.setup();
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    mocks.saveAction.mockResolvedValueOnce({
      status: "validation",
      message: "Review the highlighted content and try again.",
      fieldErrors: [{ field: "title", message: "Review the article title." }],
    });
    const postWithAssignedCover: BlogPostAdminRecord = {
      ...existingPost,
      currentRevision: {
        ...existingPost.currentRevision,
        media: [{
          mediaId: coverAsset.id,
          role: "cover",
          position: 0,
          altText: "A retained cover image",
          decorative: false,
          caption: null,
          asset: coverAsset,
        }],
      },
    };
    render(<BlogPostEditorForm post={postWithAssignedCover} media={[]} />);

    await user.click(screen.getByRole("button", { name: /^Settings$/ }));
    await screen.findByRole("dialog", { name: "Post settings" });
    fireEvent.change(screen.getByLabelText(/Schedule in Pakistan/), {
      target: { value: "2099-01-01T12:00" },
    });
    const scheduleButton = screen.getByRole("button", { name: "Schedule publication" });
    await waitFor(() => expect(scheduleButton).toBeEnabled());
    await user.click(scheduleButton);

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Post settings" })).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", { name: "Article title" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Write" })).toHaveAttribute("aria-selected", "true");
  });

  it("updates writing metrics and supports keyboard tab navigation", async () => {
    const user = userEvent.setup();
    render(<BlogPostEditorForm post={null} media={[]} />);

    await user.click(screen.getByRole("button", { name: "Change body" }));
    expect(screen.getByText("3 words")).toBeInTheDocument();
    expect(screen.getByText("1 min read")).toBeInTheDocument();

    const writeTab = screen.getByRole("tab", { name: "Write" });
    writeTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Media/ })).toHaveFocus();
    expect(screen.getByRole("tab", { name: /Media/ })).toHaveAttribute("aria-selected", "true");
  });

  it("preserves edits made while an existing draft save is pending", async () => {
    const user = userEvent.setup();
    let resolveSave!: (state: AdminPostActionState) => void;
    mocks.saveAction.mockReturnValueOnce(new Promise((resolve) => { resolveSave = resolve; }));
    render(<BlogPostEditorForm post={existingPost} media={[]} />);

    const title = screen.getByRole("textbox", { name: "Article title" });
    const saveButton = screen.getByRole("button", { name: "Save draft" });
    await user.type(title, " updated");
    await user.click(saveButton);
    await waitFor(() => expect(saveButton).toBeDisabled());
    await user.type(title, " while saving");
    resolveSave({
      status: "success",
      message: "Draft saved as a new revision.",
      postId: "post-1",
      version: 3,
    });

    await screen.findByText("Draft saved as a new revision.");
    expect(title).toHaveValue("Existing post updated while saving");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
