import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type {
  AdminBlogCommentAction,
  AdminBlogCommentActionOutcome,
  AdminBlogCommentDetail,
  AdminBlogCommentListItem,
  AdminBlogCommentListQuery,
  AdminBlogCommentListResult,
  AdminBlogCommentStatusCounts,
  BlogCommentModerationEvent,
  BlogCommentNotificationStatus,
  BlogCommentStatus,
  PendingBlogComment,
} from "@/contracts/blog-comments";
import { getPostgresPool } from "@/database/PostgresDatabase";

const defaultPageSize = 25;
const maximumPageSize = 100;
const bodyPreviewLength = 240;
const moderationTokenLifetimeMilliseconds = 7 * 24 * 60 * 60 * 1_000;
const retryClaimLifetimeMilliseconds = 5 * 60 * 1_000;

type AdminCommentRow = {
  id: string;
  post_id: string;
  post_slug: string;
  post_title: string;
  author_name: string | null;
  author_email: string | null;
  author_website: string | null;
  body: string | null;
  status: BlogCommentStatus;
  created_at: Date;
  moderated_at: Date | null;
  expires_at: Date;
  notification_status: BlogCommentNotificationStatus;
  notification_attempt_count: number;
  notification_last_attempted_at: Date | null;
  notification_sent_at: Date | null;
  notification_last_error_code: string | null;
  token_expires_at: Date | null;
  token_consumed_at: Date | null;
};

type ModerationEventRow = {
  id: string;
  action: BlogCommentModerationEvent["action"];
  source: BlogCommentModerationEvent["source"];
  actor_id: string | null;
  created_at: Date;
};

type CommentStatusRow = {
  id: string;
  post_id: string;
  post_slug: string;
  status: BlogCommentStatus;
  expires_at: Date;
};

type RetriableCommentRow = {
  id: string;
  post_id: string;
  post_slug: string;
  post_title: string;
  author_name: string;
  author_email: string;
  author_website: string | null;
  body: string;
  created_at: Date;
  expires_at: Date;
  notification_status: BlogCommentNotificationStatus;
  notification_last_attempted_at: Date | null;
};

type AdminCursor = {
  createdAt: string;
  id: string;
};

export class InvalidAdminBlogCommentCursorError extends Error {}

function moderationTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function encodeCursor(row: Pick<AdminCommentRow, "created_at" | "id">) {
  return Buffer.from(
    JSON.stringify({ createdAt: row.created_at.toISOString(), id: row.id } satisfies AdminCursor),
  ).toString("base64url");
}

function decodeCursor(value: string): AdminCursor {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    const cursor = parsed as Record<string, unknown>;
    const date = typeof cursor.createdAt === "string" ? new Date(cursor.createdAt) : null;

    if (
      !date ||
      Number.isNaN(date.getTime()) ||
      typeof cursor.id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        cursor.id,
      )
    ) {
      throw new Error();
    }

    return { createdAt: date.toISOString(), id: cursor.id };
  } catch {
    throw new InvalidAdminBlogCommentCursorError("The comment cursor is invalid.");
  }
}

function bodyPreview(body: string | null) {
  if (!body) return null;

  const characters = Array.from(body);
  if (characters.length <= bodyPreviewLength) return body;
  return `${characters.slice(0, bodyPreviewLength).join("")}…`;
}

function listItem(row: AdminCommentRow): AdminBlogCommentListItem {
  return {
    id: row.id,
    postId: row.post_id,
    postSlug: row.post_slug,
    postTitle: row.post_title,
    authorName: row.author_name,
    bodyPreview: bodyPreview(row.body),
    status: row.status,
    createdAt: row.created_at.toISOString(),
    moderatedAt: row.moderated_at?.toISOString() ?? null,
    expiresAt: row.expires_at.toISOString(),
    notificationStatus: row.notification_status,
  };
}

function searchPattern(value: string) {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

export async function listBlogCommentsForAdmin(
  query: AdminBlogCommentListQuery,
): Promise<AdminBlogCommentListResult> {
  const values: unknown[] = [];
  const conditions: string[] = [];
  const parameter = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (query.status) conditions.push(`comment.status = ${parameter(query.status)}`);
  if (query.postId) conditions.push(`comment.post_id = ${parameter(query.postId)}`);
  if (query.notificationStatus) {
    conditions.push(`comment.notification_status = ${parameter(query.notificationStatus)}`);
  }
  if (query.search) {
    const search = parameter(searchPattern(query.search));
    conditions.push(`(
      comment.post_title ILIKE ${search} ESCAPE E'\\\\'
      OR comment.post_slug ILIKE ${search} ESCAPE E'\\\\'
      OR comment.author_name ILIKE ${search} ESCAPE E'\\\\'
      OR comment.body ILIKE ${search} ESCAPE E'\\\\'
    )`);
  }
  if (query.cursor) {
    const cursor = decodeCursor(query.cursor);
    const createdAt = parameter(cursor.createdAt);
    const id = parameter(cursor.id);
    conditions.push(`(comment.created_at, comment.id) < (${createdAt}::timestamptz, ${id}::uuid)`);
  }

  const requestedLimit = query.limit ?? defaultPageSize;
  const limit = Math.max(1, Math.min(maximumPageSize, requestedLimit));
  const limitParameter = parameter(limit + 1);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await getPostgresPool().query<AdminCommentRow>(
    `
      SELECT
        comment.id,
        comment.post_id,
        comment.post_slug,
        comment.post_title,
        comment.author_name,
        comment.author_email,
        comment.author_website,
        comment.body,
        comment.status,
        comment.created_at,
        comment.moderated_at,
        comment.expires_at,
        comment.notification_status,
        comment.notification_attempt_count,
        comment.notification_last_attempted_at,
        comment.notification_sent_at,
        comment.notification_last_error_code,
        NULL::timestamptz AS token_expires_at,
        NULL::timestamptz AS token_consumed_at
      FROM comments.blog_comments AS comment
      ${where}
      ORDER BY comment.created_at DESC, comment.id DESC
      LIMIT ${limitParameter}
    `,
    values,
  );
  const hasNextPage = result.rows.length > limit;
  const rows = hasNextPage ? result.rows.slice(0, limit) : result.rows;

  return {
    items: rows.map(listItem),
    nextCursor: hasNextPage && rows.length > 0 ? encodeCursor(rows[rows.length - 1]) : null,
  };
}

export async function findBlogCommentForAdmin(
  commentId: string,
): Promise<AdminBlogCommentDetail | null> {
  const pool = getPostgresPool();
  const result = await pool.query<AdminCommentRow>(
    `
      SELECT
        comment.id,
        comment.post_id,
        comment.post_slug,
        comment.post_title,
        comment.author_name,
        comment.author_email,
        comment.author_website,
        comment.body,
        comment.status,
        comment.created_at,
        comment.moderated_at,
        comment.expires_at,
        comment.notification_status,
        comment.notification_attempt_count,
        comment.notification_last_attempted_at,
        comment.notification_sent_at,
        comment.notification_last_error_code,
        token.expires_at AS token_expires_at,
        token.consumed_at AS token_consumed_at
      FROM comments.blog_comments AS comment
      LEFT JOIN comments.blog_comment_moderation_tokens AS token
        ON token.comment_id = comment.id
      WHERE comment.id = $1
      LIMIT 1
    `,
    [commentId],
  );
  const row = result.rows[0];
  if (!row) return null;

  const eventResult = await pool.query<ModerationEventRow>(
    `
      SELECT id, action, source, actor_id, created_at
      FROM comments.blog_comment_moderation_events
      WHERE comment_id = $1
      ORDER BY created_at ASC, id ASC
    `,
    [commentId],
  );

  return {
    ...listItem(row),
    authorEmail: row.author_email,
    websiteUrl: row.author_website,
    body: row.body,
    notificationAttemptCount: row.notification_attempt_count,
    notificationLastAttemptedAt: row.notification_last_attempted_at?.toISOString() ?? null,
    notificationSentAt: row.notification_sent_at?.toISOString() ?? null,
    notificationLastErrorCode: row.notification_last_error_code,
    tokenExpiresAt: row.token_expires_at?.toISOString() ?? null,
    tokenConsumedAt: row.token_consumed_at?.toISOString() ?? null,
    moderationEvents: eventResult.rows.map((event) => ({
      id: event.id,
      action: event.action,
      source: event.source,
      actorId: event.actor_id,
      createdAt: event.created_at.toISOString(),
    })),
  };
}

export async function countBlogCommentsForAdmin(
  postId?: string,
): Promise<AdminBlogCommentStatusCounts> {
  const result = await getPostgresPool().query<AdminBlogCommentStatusCounts>(
    `
      SELECT
        COUNT(*)::integer AS total,
        (COUNT(*) FILTER (WHERE status = 'pending'))::integer AS pending,
        (COUNT(*) FILTER (WHERE status = 'approved'))::integer AS approved,
        (COUNT(*) FILTER (WHERE status = 'rejected'))::integer AS rejected,
        (COUNT(*) FILTER (WHERE status = 'removed'))::integer AS removed,
        (COUNT(*) FILTER (WHERE status = 'expired'))::integer AS expired,
        (
          COUNT(*) FILTER (
            WHERE status = 'pending' AND notification_status = 'failed'
          )
        )::integer AS "notificationFailures"
      FROM comments.blog_comments
      WHERE ($1::uuid IS NULL OR post_id = $1)
    `,
    [postId ?? null],
  );

  return result.rows[0];
}

async function expireLockedComment(client: PoolClient, commentId: string) {
  await client.query(
    `
      UPDATE comments.blog_comments
      SET
        status = 'expired',
        author_name = NULL,
        author_email = NULL,
        author_website = NULL,
        body = NULL,
        moderated_at = now()
      WHERE id = $1 AND status = 'pending'
    `,
    [commentId],
  );
  await client.query(
    `
      UPDATE comments.blog_comment_moderation_tokens
      SET
        consumed_at = COALESCE(consumed_at, now()),
        consumed_action = COALESCE(consumed_action, 'expired')
      WHERE comment_id = $1
    `,
    [commentId],
  );
  await client.query(
    `
      INSERT INTO comments.blog_comment_moderation_events (
        id,
        comment_id,
        action,
        source
      )
      VALUES ($1, $2, 'expired', 'system')
    `,
    [randomUUID(), commentId],
  );
}

export async function moderateBlogCommentById(
  commentId: string,
  action: AdminBlogCommentAction,
  actorId: string,
): Promise<AdminBlogCommentActionOutcome> {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `
        SELECT id
        FROM comments.blog_comment_moderation_tokens
        WHERE comment_id = $1
        FOR UPDATE
      `,
      [commentId],
    );
    const result = await client.query<CommentStatusRow>(
      `
        SELECT
          comment.id,
          comment.post_id,
          post.slug AS post_slug,
          comment.status,
          comment.expires_at
        FROM comments.blog_comments AS comment
        INNER JOIN content.blog_posts AS post ON post.id = comment.post_id
        WHERE comment.id = $1
        FOR UPDATE OF comment
      `,
      [commentId],
    );
    const comment = result.rows[0];

    if (!comment) {
      await client.query("ROLLBACK");
      return { status: "not_found" };
    }

    if (comment.status === "pending" && comment.expires_at.getTime() <= Date.now()) {
      await expireLockedComment(client, comment.id);
      await client.query("COMMIT");
      return { status: "conflict", currentStatus: "expired" };
    }

    const expectedStatus: BlogCommentStatus = action === "removed" ? "approved" : "pending";
    if (comment.status !== expectedStatus) {
      await client.query("ROLLBACK");
      return { status: "conflict", currentStatus: comment.status };
    }

    const update = action === "approved"
      ? await client.query<{ moderated_at: Date }>(
          `
            UPDATE comments.blog_comments
            SET
              status = 'approved',
              author_email = NULL,
              moderated_at = now()
            WHERE id = $1 AND status = 'pending'
            RETURNING moderated_at
          `,
          [comment.id],
        )
      : await client.query<{ moderated_at: Date }>(
          `
            UPDATE comments.blog_comments
            SET
              status = $2,
              author_name = NULL,
              author_email = NULL,
              author_website = NULL,
              body = NULL,
              moderated_at = now()
            WHERE id = $1 AND status = $3
            RETURNING moderated_at
          `,
          [comment.id, action, expectedStatus],
        );
    const updated = update.rows[0];

    if (!updated) {
      await client.query("ROLLBACK");
      return { status: "conflict", currentStatus: comment.status };
    }

    if (action !== "removed") {
      await client.query(
        `
          UPDATE comments.blog_comment_moderation_tokens
          SET
            consumed_at = COALESCE(consumed_at, now()),
            consumed_action = COALESCE(consumed_action, $2)
          WHERE comment_id = $1
        `,
        [comment.id, action],
      );
    }
    await client.query(
      `
        INSERT INTO comments.blog_comment_moderation_events (
          id,
          comment_id,
          action,
          source,
          actor_id
        )
        VALUES ($1, $2, $3, 'admin', $4)
      `,
      [randomUUID(), comment.id, action, actorId],
    );
    await client.query("COMMIT");

    return {
      status: "applied",
      comment: {
        id: comment.id,
        postId: comment.post_id,
        postSlug: comment.post_slug,
        previousStatus: comment.status,
        status: action,
        moderatedAt: updated.moderated_at.toISOString(),
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function prepareBlogCommentNotificationRetry(
  commentId: string,
): Promise<PendingBlogComment | null> {
  const pool = getPostgresPool();
  const client = await pool.connect();
  const moderationToken = randomBytes(32).toString("base64url");
  const tokenHash = moderationTokenHash(moderationToken);
  const notificationAttemptId = randomUUID();

  try {
    await client.query("BEGIN");
    const tokenResult = await client.query<{ id: string }>(
      `
        SELECT id
        FROM comments.blog_comment_moderation_tokens
        WHERE comment_id = $1
        FOR UPDATE
      `,
      [commentId],
    );
    const result = await client.query<RetriableCommentRow>(
      `
        SELECT
          comment.id,
          comment.post_id,
          post.slug AS post_slug,
          comment.post_title,
          comment.author_name,
          comment.author_email,
          comment.author_website,
          comment.body,
          comment.created_at,
          comment.expires_at,
          comment.notification_status,
          comment.notification_last_attempted_at
        FROM comments.blog_comments AS comment
        INNER JOIN content.blog_posts AS post ON post.id = comment.post_id
        WHERE comment.id = $1
          AND comment.status = 'pending'
          AND comment.expires_at > now() + interval '1 minute'
        FOR UPDATE OF comment
      `,
      [commentId],
    );
    const comment = result.rows[0];
    const retryClaimCutoff = Date.now() - retryClaimLifetimeMilliseconds;

    if (
      !comment ||
      comment.expires_at.getTime() <= Date.now() ||
      (comment.notification_status !== "failed" &&
        (comment.notification_status !== "pending" ||
          (comment.notification_last_attempted_at?.getTime() ?? 0) > retryClaimCutoff))
    ) {
      await client.query("ROLLBACK");
      return null;
    }

    const tokenExpiry = new Date(
      Math.min(
        Date.now() + moderationTokenLifetimeMilliseconds,
        comment.expires_at.getTime(),
      ),
    );
    const tokenRow = tokenResult.rows[0];

    if (tokenRow) {
      await client.query(
        `
          UPDATE comments.blog_comment_moderation_tokens
          SET
            token_hash = $2,
            expires_at = $3,
            consumed_at = NULL,
            consumed_action = NULL,
            created_at = now()
          WHERE id = $1
        `,
        [tokenRow.id, tokenHash, tokenExpiry],
      );
    } else {
      await client.query(
        `
          INSERT INTO comments.blog_comment_moderation_tokens (
            id,
            comment_id,
            token_hash,
            expires_at
          )
          VALUES ($1, $2, $3, $4)
        `,
        [randomUUID(), comment.id, tokenHash, tokenExpiry],
      );
    }

    await client.query(
      `
        UPDATE comments.blog_comments
        SET
          notification_status = 'pending',
          notification_attempt_id = $2,
          notification_last_attempted_at = now(),
          notification_last_error_code = NULL
        WHERE id = $1
      `,
      [comment.id, notificationAttemptId],
    );
    await client.query("COMMIT");

    return {
      id: comment.id,
      postId: comment.post_id,
      postSlug: comment.post_slug,
      postTitle: comment.post_title,
      authorName: comment.author_name,
      authorEmail: comment.author_email,
      websiteUrl: comment.author_website,
      body: comment.body,
      createdAt: comment.created_at.toISOString(),
      expiresAt: comment.expires_at.toISOString(),
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
