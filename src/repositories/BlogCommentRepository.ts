import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import type {
  ApprovedBlogComment,
  BlogCommentModerationAction,
  BlogCommentModerationPreview,
  BlogCommentModerationResult,
  PendingBlogComment,
} from "@/contracts/blog-comments";
import { getPostgresPool } from "@/database/PostgresDatabase";

type PendingBlogCommentInput = {
  postId: string;
  postSlug: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  websiteUrl: string | null;
  body: string;
};

type ApprovedCommentRow = {
  id: string;
  author_name: string;
  author_website: string | null;
  body: string;
  created_at: Date;
};

type PendingCommentRow = {
  post_slug: string;
  post_title: string;
  author_name: string;
  author_website: string | null;
  body: string;
  created_at: Date;
};

type ModerationRow = {
  id: string;
  post_slug: string;
};

type RateLimitRow = {
  attempt_count: number;
  retry_after_seconds: number;
};

type RateLimitBucket = {
  hash: string;
  limit: number;
};

const moderationTokenLifetimeMilliseconds = 7 * 24 * 60 * 60 * 1_000;
const pendingCommentLifetimeMilliseconds = 30 * 24 * 60 * 60 * 1_000;

function moderationTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPendingBlogComment(
  input: PendingBlogCommentInput,
): Promise<PendingBlogComment> {
  const pool = getPostgresPool();
  const client = await pool.connect();
  const commentId = randomUUID();
  const tokenId = randomUUID();
  const notificationAttemptId = randomUUID();
  const moderationToken = randomBytes(32).toString("base64url");
  const tokenHash = moderationTokenHash(moderationToken);

  try {
    await client.query("BEGIN");
    const result = await client.query<{ created_at: Date; expires_at: Date }>(
      `
        INSERT INTO comments.blog_comments (
          id,
          post_id,
          post_slug,
          post_title,
          author_name,
          author_email,
          author_website,
          body,
          expires_at,
          notification_attempt_id,
          notification_last_attempted_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          now() + ($9::bigint * interval '1 millisecond'),
          $10,
          now()
        )
        RETURNING created_at, expires_at
      `,
      [
        commentId,
        input.postId,
        input.postSlug,
        input.postTitle,
        input.authorName,
        input.authorEmail,
        input.websiteUrl,
        input.body,
        pendingCommentLifetimeMilliseconds,
        notificationAttemptId,
      ],
    );

    await client.query(
      `
        INSERT INTO comments.blog_comment_moderation_tokens (
          id,
          comment_id,
          token_hash,
          expires_at
        )
        VALUES ($1, $2, $3, now() + ($4::bigint * interval '1 millisecond'))
      `,
      [tokenId, commentId, tokenHash, moderationTokenLifetimeMilliseconds],
    );
    await client.query("COMMIT");

    return {
      id: commentId,
      ...input,
      createdAt: result.rows[0].created_at.toISOString(),
      expiresAt: result.rows[0].expires_at.toISOString(),
      moderationToken,
      notificationAttemptId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deletePendingBlogComment(commentId: string) {
  await getPostgresPool().query(
    `
      WITH pending_comment AS (
        SELECT comment.id
        FROM comments.blog_comment_moderation_tokens AS token
        INNER JOIN comments.blog_comments AS comment ON comment.id = token.comment_id
        WHERE comment.id = $1
          AND comment.status = 'pending'
        FOR UPDATE OF token
      )
      DELETE FROM comments.blog_comments AS comment
      USING pending_comment AS pending
      WHERE comment.id = pending.id
    `,
    [commentId],
  );
}

export async function deleteExpiredPendingBlogComments() {
  const { expirePendingBlogComments } = await import("./BlogCommentLifecycleRepository");
  await expirePendingBlogComments();
}

export async function markBlogCommentNotificationSent(
  commentId: string,
  notificationAttemptId: string,
) {
  const result = await getPostgresPool().query(
    `
      UPDATE comments.blog_comments
      SET
        notification_status = 'sent',
        notification_attempt_count = notification_attempt_count + 1,
        notification_last_attempted_at = now(),
        notification_sent_at = now(),
        notification_last_error_code = NULL
      WHERE id = $1
        AND notification_attempt_id = $2
    `,
    [commentId, notificationAttemptId],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function markBlogCommentNotificationFailed(
  commentId: string,
  notificationAttemptId: string,
  errorCode: string,
) {
  const result = await getPostgresPool().query(
    `
      UPDATE comments.blog_comments
      SET
        notification_status = 'failed',
        notification_attempt_count = notification_attempt_count + 1,
        notification_last_attempted_at = now(),
        notification_last_error_code = $3
      WHERE id = $1
        AND notification_attempt_id = $2
    `,
    [commentId, notificationAttemptId, errorCode.slice(0, 80)],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function listApprovedBlogComments(
  postId: string,
): Promise<readonly ApprovedBlogComment[]> {
  const result = await getPostgresPool().query<ApprovedCommentRow>(
    `
      SELECT id, author_name, author_website, body, created_at
      FROM comments.blog_comments
      WHERE post_id = $1
        AND status = 'approved'
      ORDER BY created_at ASC, id ASC
      LIMIT 100
    `,
    [postId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    websiteUrl: row.author_website,
    body: row.body,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function findBlogCommentForModeration(
  token: string,
): Promise<BlogCommentModerationPreview | null> {
  const result = await getPostgresPool().query<PendingCommentRow>(
    `
      SELECT
        comment.post_slug,
        comment.post_title,
        comment.author_name,
        comment.author_website,
        comment.body,
        comment.created_at
      FROM comments.blog_comment_moderation_tokens AS token
      INNER JOIN comments.blog_comments AS comment ON comment.id = token.comment_id
      WHERE token.token_hash = $1
        AND token.consumed_at IS NULL
        AND token.expires_at > now()
        AND comment.status = 'pending'
        AND comment.expires_at > now()
      LIMIT 1
    `,
    [moderationTokenHash(token)],
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    postSlug: row.post_slug,
    postTitle: row.post_title,
    authorName: row.author_name,
    websiteUrl: row.author_website,
    body: row.body,
    createdAt: row.created_at.toISOString(),
  };
}

export async function moderateBlogComment(
  token: string,
  action: BlogCommentModerationAction,
): Promise<BlogCommentModerationResult | null> {
  const pool = getPostgresPool();
  const client = await pool.connect();
  const tokenHash = moderationTokenHash(token);

  try {
    await client.query("BEGIN");
    const tokenResult = await client.query<{ comment_id: string }>(
      `
        SELECT comment_id
        FROM comments.blog_comment_moderation_tokens
        WHERE token_hash = $1
          AND consumed_at IS NULL
          AND expires_at > now()
        FOR UPDATE
      `,
      [tokenHash],
    );
    const tokenRow = tokenResult.rows[0];

    if (!tokenRow) {
      await client.query("ROLLBACK");
      return null;
    }

    const commentResult =
      action === "approved"
        ? await client.query<ModerationRow>(
            `
              UPDATE comments.blog_comments
              SET
                status = 'approved',
                author_email = NULL,
                moderated_at = now()
              WHERE id = $1
                AND status = 'pending'
                AND expires_at > now()
              RETURNING id, post_slug
            `,
            [tokenRow.comment_id],
          )
        : await client.query<ModerationRow>(
            `
              UPDATE comments.blog_comments
              SET
                status = 'rejected',
                author_name = NULL,
                author_email = NULL,
                author_website = NULL,
                body = NULL,
                moderated_at = now()
              WHERE id = $1
                AND status = 'pending'
                AND expires_at > now()
              RETURNING id, post_slug
            `,
            [tokenRow.comment_id],
          );
    const commentRow = commentResult.rows[0];

    if (!commentRow) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE comments.blog_comment_moderation_tokens
        SET consumed_at = now(), consumed_action = $2
        WHERE token_hash = $1
      `,
      [tokenHash, action],
    );
    await client.query(
      `
        INSERT INTO comments.blog_comment_moderation_events (
          id,
          comment_id,
          action,
          source
        )
        VALUES ($1, $2, $3, 'email_token')
      `,
      [randomUUID(), commentRow.id, action],
    );
    await client.query("COMMIT");

    return {
      postSlug: commentRow.post_slug,
      action,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function consumeBlogCommentRateLimits(
  buckets: readonly RateLimitBucket[],
  windowMilliseconds: number,
) {
  if (!Number.isSafeInteger(windowMilliseconds) || windowMilliseconds <= 0) {
    throw new RangeError("The rate-limit window must be a positive integer.");
  }

  for (const bucket of buckets) {
    if (!Number.isSafeInteger(bucket.limit) || bucket.limit <= 0) {
      throw new RangeError("Each rate-limit bucket must have a positive integer limit.");
    }
  }

  const pool = getPostgresPool();
  const client = await pool.connect();
  let retryAfterSeconds = 0;

  try {
    await client.query("BEGIN");

    for (const bucket of buckets) {
      const result = await client.query<RateLimitRow>(
        `
          INSERT INTO comments.blog_comment_rate_limits (
            bucket_hash,
            attempt_count,
            window_started_at,
            expires_at
          )
          VALUES ($1, 1, now(), now() + ($2::bigint * interval '1 millisecond'))
          ON CONFLICT (bucket_hash) DO UPDATE
          SET
            attempt_count = CASE
              WHEN comments.blog_comment_rate_limits.expires_at <= now() THEN 1
              ELSE comments.blog_comment_rate_limits.attempt_count + 1
            END,
            window_started_at = CASE
              WHEN comments.blog_comment_rate_limits.expires_at <= now() THEN now()
              ELSE comments.blog_comment_rate_limits.window_started_at
            END,
            expires_at = CASE
              WHEN comments.blog_comment_rate_limits.expires_at <= now()
                THEN now() + ($2::bigint * interval '1 millisecond')
              ELSE comments.blog_comment_rate_limits.expires_at
            END
          RETURNING
            attempt_count,
            GREATEST(
              1,
              CEIL(EXTRACT(EPOCH FROM (expires_at - now())))::integer
            ) AS retry_after_seconds
        `,
        [bucket.hash, windowMilliseconds],
      );
      const row = result.rows[0];

      if (row.attempt_count > bucket.limit) {
        retryAfterSeconds = Math.max(
          retryAfterSeconds,
          row.retry_after_seconds,
        );
      }
    }

    await client.query(
      `DELETE FROM comments.blog_comment_rate_limits WHERE expires_at < now() - interval '1 day'`,
    );
    await client.query("COMMIT");

    return retryAfterSeconds;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
