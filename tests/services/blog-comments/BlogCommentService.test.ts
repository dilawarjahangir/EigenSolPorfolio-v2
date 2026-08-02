// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPublishedPost: vi.fn(),
  consumeRateLimits: vi.fn(),
  createPending: vi.fn(),
  findForModeration: vi.fn(),
  listApproved: vi.fn(),
  markFailed: vi.fn(),
  markSent: vi.fn(),
  moderateByToken: vi.fn(),
  countAdmin: vi.fn(),
  findAdmin: vi.fn(),
  listAdmin: vi.fn(),
  moderateById: vi.fn(),
  prepareRetry: vi.fn(),
  maintain: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/services/blog-posts/BlogPostService", () => ({
  getPublishedBlogPostReferenceBySlug: mocks.getPublishedPost,
}));
vi.mock("@/repositories/BlogCommentRepository", () => ({
  consumeBlogCommentRateLimits: mocks.consumeRateLimits,
  createPendingBlogComment: mocks.createPending,
  findBlogCommentForModeration: mocks.findForModeration,
  listApprovedBlogComments: mocks.listApproved,
  markBlogCommentNotificationFailed: mocks.markFailed,
  markBlogCommentNotificationSent: mocks.markSent,
  moderateBlogComment: mocks.moderateByToken,
}));
vi.mock("@/repositories/AdminBlogCommentRepository", () => ({
  InvalidAdminBlogCommentCursorError: class InvalidAdminBlogCommentCursorError extends Error {},
  countBlogCommentsForAdmin: mocks.countAdmin,
  findBlogCommentForAdmin: mocks.findAdmin,
  listBlogCommentsForAdmin: mocks.listAdmin,
  moderateBlogCommentById: mocks.moderateById,
  prepareBlogCommentNotificationRetry: mocks.prepareRetry,
}));
vi.mock("@/repositories/BlogCommentLifecycleRepository", () => ({
  maintainBlogCommentLifecycle: mocks.maintain,
}));
vi.mock("@/lib/form-mail", () => ({
  sendBlogCommentModerationEmail: mocks.sendEmail,
}));

import {
  applyAdminBlogCommentAction,
  applyBlogCommentModeration,
  BlogCommentAdminValidationError,
  BlogCommentValidationError,
  retryBlogCommentModerationNotification,
  submitBlogComment,
} from "@/services/blog-comments/BlogCommentService";

const post = {
  id: "10000000-0000-4000-8000-000000000001",
  slug: "published-article",
  title: "Published article",
};
const pending = {
  id: "20000000-0000-4000-8000-000000000001",
  postId: post.id,
  postSlug: post.slug,
  postTitle: post.title,
  authorName: "Reader Name",
  authorEmail: "reader@example.com",
  websiteUrl: null,
  body: "A useful public comment.",
  createdAt: "2026-08-02T00:00:00.000Z",
  expiresAt: "2026-09-01T00:00:00.000Z",
  moderationToken: "a".repeat(43),
  notificationAttemptId: "30000000-0000-4000-8000-000000000001",
};
const submission = {
  kind: "blog-comment" as const,
  companyUrl: "",
  name: pending.authorName,
  email: pending.authorEmail,
  website: "",
  comment: pending.body,
  postSlug: post.slug,
};

describe("blog comment workflow", () => {
  beforeEach(() => {
    process.env.COMMENT_RATE_LIMIT_SECRET = "unit-test-secret-that-is-at-least-32-characters";
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getPublishedPost.mockResolvedValue(post);
    mocks.consumeRateLimits.mockResolvedValue(0);
    mocks.maintain.mockResolvedValue({
      expiredCount: 0,
      purgedTokenCount: 0,
      purgedCommentCount: 0,
    });
    mocks.createPending.mockResolvedValue(pending);
    mocks.markFailed.mockResolvedValue(true);
    mocks.markSent.mockResolvedValue(true);
  });

  it("rejects comments for anything other than a currently published post", async () => {
    mocks.getPublishedPost.mockResolvedValue(null);

    await expect(submitBlogComment(submission, "127.0.0.1")).rejects.toBeInstanceOf(
      BlogCommentValidationError,
    );
    expect(mocks.consumeRateLimits).not.toHaveBeenCalled();
    expect(mocks.createPending).not.toHaveBeenCalled();
  });

  it("retains a pending comment and records sanitized notification failure state", async () => {
    mocks.sendEmail.mockRejectedValue(Object.assign(new Error("SMTP unavailable"), { code: "ECONNRESET" }));

    await expect(submitBlogComment(submission, "127.0.0.1")).resolves.toBeUndefined();

    expect(mocks.createPending).toHaveBeenCalledWith(
      expect.objectContaining({ postId: post.id, postSlug: post.slug }),
    );
    expect(mocks.markFailed).toHaveBeenCalledWith(
      pending.id,
      pending.notificationAttemptId,
      "ECONNRESET",
    );
    expect(mocks.markSent).not.toHaveBeenCalled();
  });

  it("retries with a freshly prepared token and reports delivery success", async () => {
    mocks.prepareRetry.mockResolvedValue(pending);
    mocks.sendEmail.mockResolvedValue(undefined);

    await expect(retryBlogCommentModerationNotification(pending.id)).resolves.toEqual({
      status: "sent",
      commentId: pending.id,
    });
    expect(mocks.markSent).toHaveBeenCalledWith(
      pending.id,
      pending.notificationAttemptId,
    );
  });

  it("rejects malformed email-link tokens and non-owner-shaped admin actors", async () => {
    await expect(applyBlogCommentModeration("not-a-token", "approved")).resolves.toBeNull();
    expect(mocks.moderateByToken).not.toHaveBeenCalled();

    await expect(
      applyAdminBlogCommentAction(pending.id, "approved", "not-a-uuid"),
    ).rejects.toBeInstanceOf(BlogCommentAdminValidationError);
    expect(mocks.moderateById).not.toHaveBeenCalled();
  });
});
