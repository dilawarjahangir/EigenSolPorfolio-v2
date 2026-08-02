// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class BlogCmsValidationError extends Error {}
  class BlogCmsNotFoundError extends Error {}
  class BlogCmsConflictError extends Error {
    actualVersion?: number;

    constructor(message: string, _code?: string, actualVersion?: number) {
      super(message);
      this.actualVersion = actualVersion;
    }
  }

  return {
    requireOwner: vi.fn(),
    revalidatePath: vi.fn(),
    createBlogPostDraft: vi.fn(),
    updateBlogPostDraft: vi.fn(),
    publishBlogPost: vi.fn(),
    hardDeleteBlogPost: vi.fn(),
    getActiveBlogPublicationSchedule: vi.fn(),
    scheduleBlogPublication: vi.fn(),
    cancelBlogPublication: vi.fn(),
    assertBlogRevisionPublishable: vi.fn(),
    BlogCmsValidationError,
    BlogCmsNotFoundError,
    BlogCmsConflictError,
  };
});

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/services/auth/AdminAuthService", () => ({ requireOwner: mocks.requireOwner }));
vi.mock("@/services/blog-posts/BlogPostValidationService", () => ({
  assertBlogRevisionPublishable: mocks.assertBlogRevisionPublishable,
}));
vi.mock("@/services/blog-posts/BlogPublicationService", () => ({
  cancelBlogPublication: mocks.cancelBlogPublication,
  scheduleBlogPublication: mocks.scheduleBlogPublication,
}));
vi.mock("@/services/blog-posts/BlogPostService", () => ({
  archiveBlogPost: vi.fn(),
  hardDeleteBlogPost: mocks.hardDeleteBlogPost,
  restoreBlogPost: vi.fn(),
  unpublishBlogPost: vi.fn(),
  getBlogPostForEditing: vi.fn(),
  getBlogPostRevision: vi.fn(),
  createBlogPostDraft: mocks.createBlogPostDraft,
  updateBlogPostDraft: mocks.updateBlogPostDraft,
  publishBlogPost: mocks.publishBlogPost,
  getActiveBlogPublicationSchedule: mocks.getActiveBlogPublicationSchedule,
  BlogCmsValidationError: mocks.BlogCmsValidationError,
  BlogCmsNotFoundError: mocks.BlogCmsNotFoundError,
  BlogCmsConflictError: mocks.BlogCmsConflictError,
}));

import {
  hardDeleteBlogPostAction,
  saveBlogPostAction,
} from "@/app/admin/(protected)/posts/actions";
import { redirect } from "next/navigation";

function postForm(intent: "save" | "publish" | "schedule") {
  const formData = new FormData();
  formData.set("expectedVersion", "0");
  formData.set("intent", intent);
  formData.set("title", "Working draft");
  formData.set("slug", "working-draft");
  formData.set("contentDocument", JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "Draft body" }] }],
  }));
  return formData;
}

describe("saveBlogPostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireOwner.mockResolvedValue({ userId: "owner-1" });
    mocks.getActiveBlogPublicationSchedule.mockResolvedValue(null);
    mocks.createBlogPostDraft.mockResolvedValue({
      postId: "post-1",
      currentRevisionId: "revision-1",
      slug: "working-draft",
      version: 1,
    });
  });

  it("allows an incomplete article to be saved as a draft", async () => {
    const result = await saveBlogPostAction({ status: "idle" }, postForm("save"));

    expect(result).toMatchObject({ status: "success", postId: "post-1", version: 1 });
    expect(mocks.createBlogPostDraft).toHaveBeenCalledWith(expect.objectContaining({
      slug: "working-draft",
      revision: expect.objectContaining({ excerpt: "", category: "", author: "" }),
    }));
    expect(mocks.assertBlogRevisionPublishable).not.toHaveBeenCalled();
  });

  it("keeps publishing fields mandatory for publish and schedule", async () => {
    const publishResult = await saveBlogPostAction({ status: "idle" }, postForm("publish"));
    const scheduleResult = await saveBlogPostAction({ status: "idle" }, postForm("schedule"));

    expect(publishResult).toMatchObject({ status: "validation" });
    expect(scheduleResult).toMatchObject({ status: "validation" });
    if (publishResult.status === "validation") {
      expect(publishResult.fieldErrors.map((error) => error.field)).toEqual(
        expect.arrayContaining(["excerpt", "category", "author", "authorRole"]),
      );
    }
    if (scheduleResult.status === "validation") {
      expect(scheduleResult.fieldErrors.map((error) => error.field)).toContain("scheduleAt");
    }
    expect(mocks.createBlogPostDraft).not.toHaveBeenCalled();
  });

  it("returns field-level errors for invalid video and schedule values", async () => {
    const invalidVideo = postForm("save");
    invalidVideo.set("videoId", "not a video id");
    const invalidVideoResult = await saveBlogPostAction({ status: "idle" }, invalidVideo);

    expect(invalidVideoResult).toMatchObject({ status: "validation" });
    if (invalidVideoResult.status === "validation") {
      expect(invalidVideoResult.fieldErrors).toContainEqual(expect.objectContaining({ field: "videoId" }));
    }

    const pastSchedule = postForm("schedule");
    pastSchedule.set("excerpt", "A complete excerpt that is ready to publish.");
    pastSchedule.set("category", "Engineering");
    pastSchedule.set("author", "EigenSol Engineering");
    pastSchedule.set("authorRole", "Engineering Team");
    pastSchedule.set("scheduleAt", "2000-01-01T12:00");
    const pastScheduleResult = await saveBlogPostAction({ status: "idle" }, pastSchedule);

    expect(pastScheduleResult).toMatchObject({ status: "validation" });
    if (pastScheduleResult.status === "validation") {
      expect(pastScheduleResult.fieldErrors).toContainEqual(expect.objectContaining({ field: "scheduleAt" }));
    }
    expect(mocks.createBlogPostDraft).not.toHaveBeenCalled();
  });

  it("converts a valid Pakistan schedule to UTC and freezes the saved revision", async () => {
    const formData = postForm("schedule");
    formData.set("excerpt", "A complete excerpt that is ready to publish.");
    formData.set("category", "Engineering");
    formData.set("author", "EigenSol Engineering");
    formData.set("authorRole", "Engineering Team");
    formData.set("scheduleAt", "2099-01-01T12:00");
    formData.set("coverMediaId", "asset-1");
    formData.set("coverAltText", "Engineers reviewing a platform diagram");

    const result = await saveBlogPostAction({ status: "idle" }, formData);

    expect(result).toMatchObject({ status: "success", postId: "post-1" });
    expect(mocks.assertBlogRevisionPublishable).toHaveBeenCalledOnce();
    expect(mocks.scheduleBlogPublication).toHaveBeenCalledWith({
      postId: "post-1",
      expectedVersion: 1,
      revisionId: "revision-1",
      action: "publish",
      executeAt: "2099-01-01T07:00:00.000Z",
      actor: { id: "owner-1" },
    });
  });
});

describe("hardDeleteBlogPostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireOwner.mockResolvedValue({ userId: "owner-1" });
    mocks.hardDeleteBlogPost.mockResolvedValue({
      postId: "post-1",
      slug: "archived-post",
      revisionCount: 3,
      commentCount: 2,
    });
  });

  it("requires owner access, deletes the archived post, revalidates affected routes, and redirects to the post list", async () => {
    const formData = new FormData();
    formData.set("postId", "post-1");
    formData.set("expectedVersion", "7");

    await hardDeleteBlogPostAction(formData);

    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.hardDeleteBlogPost).toHaveBeenCalledWith({
      postId: "post-1",
      expectedVersion: 7,
      actor: { id: "owner-1" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/posts");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blogs");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blogs/archived-post");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    expect(redirect).toHaveBeenCalledWith("/admin/posts?notice=deleted");
  });
});
