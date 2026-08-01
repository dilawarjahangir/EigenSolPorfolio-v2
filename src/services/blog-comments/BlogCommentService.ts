import "server-only";

import { createHmac } from "node:crypto";
import type {
  ApprovedBlogComment,
  BlogCommentModerationAction,
  BlogCommentModerationPreview,
} from "@/contracts/blog-comments";
import { getBlogPostBySlug } from "@/data/blogs";
import { databaseErrorCode } from "@/database/PostgresDatabase";
import { sendBlogCommentModerationEmail } from "@/lib/form-mail";
import type { BlogCommentSubmission } from "@/lib/form-submission";
import { absoluteUrl } from "@/lib/seo";
import {
  consumeBlogCommentRateLimits,
  createPendingBlogComment,
  deleteExpiredPendingBlogComments,
  deletePendingBlogComment,
  findBlogCommentForModeration,
  listApprovedBlogComments,
  moderateBlogComment,
} from "@/repositories/BlogCommentRepository";

const moderationTokenPattern = /^[A-Za-z0-9_-]{43}$/;
const rateLimitWindowMilliseconds = 10 * 60 * 1_000;

export class BlogCommentValidationError extends Error {}

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

export async function submitBlogComment(
  submission: BlogCommentSubmission,
  clientIdentifier: string,
) {
  const post = getBlogPostBySlug(submission.postSlug);

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

  await deleteExpiredPendingBlogComments();

  const pendingComment = await createPendingBlogComment({
    postSlug: post.slug,
    postTitle: post.title,
    authorName: submission.name,
    authorEmail: submission.email,
    websiteUrl: submission.website || null,
    body: submission.comment,
  });
  const moderationUrl = `${absoluteUrl("/blog-comments/moderate")}#token=${pendingComment.moderationToken}`;

  try {
    await sendBlogCommentModerationEmail({
      postSlug: pendingComment.postSlug,
      postTitle: pendingComment.postTitle,
      authorName: pendingComment.authorName,
      authorEmail: pendingComment.authorEmail,
      websiteUrl: pendingComment.websiteUrl,
      body: pendingComment.body,
      createdAt: pendingComment.createdAt,
      moderationUrl,
    });
  } catch (error) {
    try {
      await deletePendingBlogComment(pendingComment.id);
    } catch (cleanupError) {
      console.error("Failed to clean up a comment after notification failure", {
        code: databaseErrorCode(cleanupError),
      });
    }

    throw error;
  }
}

export async function getApprovedBlogComments(
  postSlug: string,
): Promise<readonly ApprovedBlogComment[]> {
  try {
    return await listApprovedBlogComments(postSlug);
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
