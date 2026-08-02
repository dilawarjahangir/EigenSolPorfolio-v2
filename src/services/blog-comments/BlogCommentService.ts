import "server-only";

import { createHmac } from "node:crypto";
import type {
  AdminBlogCommentAction,
  AdminBlogCommentActionOutcome,
  AdminBlogCommentDetail,
  AdminBlogCommentListQuery,
  AdminBlogCommentListResult,
  AdminBlogCommentStatusCounts,
  ApprovedBlogComment,
  BlogCommentLifecycleMaintenanceResult,
  BlogCommentModerationAction,
  BlogCommentModerationPreview,
  BlogCommentNotificationRetryOutcome,
} from "@/contracts/blog-comments";
import {
  blogCommentNotificationStatuses,
  blogCommentStatuses,
} from "@/contracts/blog-comments";
import { databaseErrorCode } from "@/database/PostgresDatabase";
import { sendBlogCommentModerationEmail } from "@/lib/form-mail";
import type { BlogCommentSubmission } from "@/lib/form-submission";
import { absoluteUrl } from "@/lib/seo";
import {
  countBlogCommentsForAdmin,
  findBlogCommentForAdmin,
  InvalidAdminBlogCommentCursorError,
  listBlogCommentsForAdmin,
  moderateBlogCommentById,
  prepareBlogCommentNotificationRetry,
} from "@/repositories/AdminBlogCommentRepository";
import { maintainBlogCommentLifecycle } from "@/repositories/BlogCommentLifecycleRepository";
import {
  consumeBlogCommentRateLimits,
  createPendingBlogComment,
  findBlogCommentForModeration,
  listApprovedBlogComments,
  markBlogCommentNotificationFailed,
  markBlogCommentNotificationSent,
  moderateBlogComment,
} from "@/repositories/BlogCommentRepository";
import { getPublishedBlogPostReferenceBySlug } from "@/services/blog-posts/BlogPostService";

const moderationTokenPattern = /^[A-Za-z0-9_-]{43}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const rateLimitWindowMilliseconds = 10 * 60 * 1_000;
const maximumAdminSearchLength = 100;
const maximumAdminPageSize = 100;

export class BlogCommentValidationError extends Error {}

export class BlogCommentAdminValidationError extends Error {}

export class BlogCommentRateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super("Blog comment rate limit exceeded");
  }
}

function rateLimitSecret() {
  const secret = process.env.COMMENT_RATE_LIMIT_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error("Missing or invalid comment rate-limit configuration");
  }

  return secret;
}

function rateLimitHash(value: string) {
  return createHmac("sha256", rateLimitSecret()).update(value).digest("hex");
}

function moderationTokenIsValid(token: string) {
  return moderationTokenPattern.test(token);
}

function uuidIsValid(value: string) {
  return uuidPattern.test(value);
}

function moderationNotification(pendingComment: {
  postSlug: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  websiteUrl: string | null;
  body: string;
  createdAt: string;
  moderationToken: string;
}) {
  return {
    postSlug: pendingComment.postSlug,
    postTitle: pendingComment.postTitle,
    authorName: pendingComment.authorName,
    authorEmail: pendingComment.authorEmail,
    websiteUrl: pendingComment.websiteUrl,
    body: pendingComment.body,
    createdAt: pendingComment.createdAt,
    moderationUrl: `${absoluteUrl("/blog-comments/moderate")}#token=${pendingComment.moderationToken}`,
  };
}

function normalizeAdminListQuery(
  query: AdminBlogCommentListQuery,
): AdminBlogCommentListQuery {
  if (query.status && !blogCommentStatuses.includes(query.status)) {
    throw new BlogCommentAdminValidationError("The comment status filter is invalid.");
  }
  if (
    query.notificationStatus &&
    !blogCommentNotificationStatuses.includes(query.notificationStatus)
  ) {
    throw new BlogCommentAdminValidationError("The notification filter is invalid.");
  }
  if (query.postId && !uuidIsValid(query.postId)) {
    throw new BlogCommentAdminValidationError("The selected article is invalid.");
  }
  if (
    query.limit !== undefined &&
    (!Number.isSafeInteger(query.limit) || query.limit < 1 || query.limit > maximumAdminPageSize)
  ) {
    throw new BlogCommentAdminValidationError("The comment page size is invalid.");
  }
  if (query.cursor && query.cursor.length > 500) {
    throw new BlogCommentAdminValidationError("The comment cursor is invalid.");
  }

  const search = query.search?.trim() || undefined;
  if (search && search.length > maximumAdminSearchLength) {
    throw new BlogCommentAdminValidationError("The comment search is too long.");
  }

  return { ...query, search };
}

export async function submitBlogComment(
  submission: BlogCommentSubmission,
  clientIdentifier: string,
) {
  const post = await getPublishedBlogPostReferenceBySlug(submission.postSlug);

  if (!post) {
    throw new BlogCommentValidationError("The selected article does not exist.");
  }

  const buckets = [
    { hash: rateLimitHash(`email:${submission.email.trim().toLowerCase()}`), limit: 3 },
    ...(clientIdentifier === "unknown"
      ? []
      : [{ hash: rateLimitHash(`ip:${clientIdentifier}`), limit: 5 }]),
  ];
  const retryAfterSeconds = await consumeBlogCommentRateLimits(
    buckets,
    rateLimitWindowMilliseconds,
  );

  if (retryAfterSeconds > 0) {
    throw new BlogCommentRateLimitError(retryAfterSeconds);
  }

  try {
    await maintainBlogCommentLifecycle();
  } catch (error) {
    console.error("Blog comment lifecycle maintenance could not be completed", {
      code: databaseErrorCode(error),
    });
  }

  const pendingComment = await createPendingBlogComment({
    postId: post.id,
    postSlug: post.slug,
    postTitle: post.title,
    authorName: submission.name,
    authorEmail: submission.email,
    websiteUrl: submission.website || null,
    body: submission.comment,
  });

  try {
    await sendBlogCommentModerationEmail(moderationNotification(pendingComment));
  } catch (error) {
    try {
      await markBlogCommentNotificationFailed(
        pendingComment.id,
        pendingComment.notificationAttemptId,
        databaseErrorCode(error),
      );
    } catch (stateError) {
      console.error("Blog comment notification state could not be recorded", {
        code: databaseErrorCode(stateError),
      });
    }

    console.error("Blog comment moderation notification was not accepted", {
      code: databaseErrorCode(error),
    });
    return;
  }

  try {
    await markBlogCommentNotificationSent(
      pendingComment.id,
      pendingComment.notificationAttemptId,
    );
  } catch (error) {
    console.error("Blog comment notification success state could not be recorded", {
      code: databaseErrorCode(error),
    });
  }
}

export async function getApprovedBlogComments(
  postSlug: string,
): Promise<readonly ApprovedBlogComment[]> {
  try {
    const post = await getPublishedBlogPostReferenceBySlug(postSlug);
    if (!post) return [];
    return await listApprovedBlogComments(post.id);
  } catch (error) {
    console.error("Approved blog comments could not be loaded", {
      code: databaseErrorCode(error),
    });
    return [];
  }
}

export async function previewBlogCommentModeration(
  token: string,
): Promise<BlogCommentModerationPreview | null> {
  if (!moderationTokenIsValid(token)) return null;
  return findBlogCommentForModeration(token);
}

export async function applyBlogCommentModeration(
  token: string,
  action: BlogCommentModerationAction,
) {
  if (
    !moderationTokenIsValid(token) ||
    (action !== "approved" && action !== "rejected")
  ) {
    return null;
  }

  return moderateBlogComment(token, action);
}

export async function getAdminBlogComments(
  query: AdminBlogCommentListQuery = {},
): Promise<AdminBlogCommentListResult> {
  try {
    return await listBlogCommentsForAdmin(normalizeAdminListQuery(query));
  } catch (error) {
    if (error instanceof InvalidAdminBlogCommentCursorError) {
      throw new BlogCommentAdminValidationError(error.message);
    }
    throw error;
  }
}

export async function getAdminBlogComment(
  commentId: string,
): Promise<AdminBlogCommentDetail | null> {
  if (!uuidIsValid(commentId)) {
    throw new BlogCommentAdminValidationError("The comment identifier is invalid.");
  }

  return findBlogCommentForAdmin(commentId);
}

export async function getAdminBlogCommentCounts(
  postId?: string,
): Promise<AdminBlogCommentStatusCounts> {
  if (postId && !uuidIsValid(postId)) {
    throw new BlogCommentAdminValidationError("The selected article is invalid.");
  }

  return countBlogCommentsForAdmin(postId);
}

export async function applyAdminBlogCommentAction(
  commentId: string,
  action: AdminBlogCommentAction,
  actorId: string,
): Promise<AdminBlogCommentActionOutcome> {
  if (!uuidIsValid(commentId)) {
    throw new BlogCommentAdminValidationError("The comment identifier is invalid.");
  }
  if (action !== "approved" && action !== "rejected" && action !== "removed") {
    throw new BlogCommentAdminValidationError("The moderation action is invalid.");
  }
  if (!uuidIsValid(actorId)) {
    throw new BlogCommentAdminValidationError("The moderator identifier is invalid.");
  }

  return moderateBlogCommentById(commentId, action, actorId);
}

export async function retryBlogCommentModerationNotification(
  commentId: string,
): Promise<BlogCommentNotificationRetryOutcome> {
  if (!uuidIsValid(commentId)) {
    throw new BlogCommentAdminValidationError("The comment identifier is invalid.");
  }

  const pendingComment = await prepareBlogCommentNotificationRetry(commentId);
  if (!pendingComment) return { status: "not_available" };

  try {
    await sendBlogCommentModerationEmail(moderationNotification(pendingComment));
  } catch (error) {
    await markBlogCommentNotificationFailed(
      pendingComment.id,
      pendingComment.notificationAttemptId,
      databaseErrorCode(error),
    );
    console.error("Blog comment moderation notification retry was not accepted", {
      code: databaseErrorCode(error),
    });
    return { status: "failed", commentId: pendingComment.id };
  }

  await markBlogCommentNotificationSent(
    pendingComment.id,
    pendingComment.notificationAttemptId,
  );
  return { status: "sent", commentId: pendingComment.id };
}

export async function runBlogCommentLifecycleMaintenance(): Promise<BlogCommentLifecycleMaintenanceResult> {
  return maintainBlogCommentLifecycle();
}
