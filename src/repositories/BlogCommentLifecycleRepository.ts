import "server-only";

import { randomUUID } from "node:crypto";
import type { BlogCommentLifecycleMaintenanceResult } from "@/contracts/blog-comments";
import { getPostgresPool } from "@/database/PostgresDatabase";

const maintenanceBatchSize = 100;

export async function expirePendingBlogComments() {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const candidates = await client.query<{ id: string }>(
      `
        SELECT id
        FROM comments.blog_comments
        WHERE status = 'pending'
          AND expires_at <= now()
        ORDER BY expires_at ASC, id ASC
        LIMIT $1
      `,
      [maintenanceBatchSize],
    );
    const candidateIds = candidates.rows.map((row) => row.id);

    if (candidateIds.length === 0) {
      await client.query("COMMIT");
      return 0;
    }

    await client.query(
      `
        SELECT id
        FROM comments.blog_comment_moderation_tokens
        WHERE comment_id = ANY($1::uuid[])
        ORDER BY comment_id ASC
        FOR UPDATE
      `,
      [candidateIds],
    );
    const lockedComments = await client.query<{ id: string }>(
      `
        SELECT id
        FROM comments.blog_comments
        WHERE id = ANY($1::uuid[])
          AND status = 'pending'
          AND expires_at <= now()
        ORDER BY id ASC
        FOR UPDATE
      `,
      [candidateIds],
    );
    const expiredIds = lockedComments.rows.map((row) => row.id);

    if (expiredIds.length === 0) {
      await client.query("COMMIT");
      return 0;
    }

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
        WHERE id = ANY($1::uuid[])
      `,
      [expiredIds],
    );
    await client.query(
      `
        UPDATE comments.blog_comment_moderation_tokens
        SET
          consumed_at = COALESCE(consumed_at, now()),
          consumed_action = COALESCE(consumed_action, 'expired')
        WHERE comment_id = ANY($1::uuid[])
      `,
      [expiredIds],
    );
    await client.query(
      `
        INSERT INTO comments.blog_comment_moderation_events (
          id,
          comment_id,
          action,
          source
        )
        SELECT event.id, event.comment_id, 'expired', 'system'
        FROM unnest($1::uuid[], $2::uuid[]) AS event(comment_id, id)
      `,
      [expiredIds, expiredIds.map(() => randomUUID())],
    );
    await client.query("COMMIT");

    return expiredIds.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function purgeBlogCommentTokens() {
  const result = await getPostgresPool().query(
    `
      WITH purgeable AS (
        SELECT id
        FROM comments.blog_comment_moderation_tokens
        WHERE
          consumed_at <= now() - interval '30 days'
          OR expires_at <= now() - interval '30 days'
        ORDER BY COALESCE(consumed_at, expires_at) ASC, id ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      )
      DELETE FROM comments.blog_comment_moderation_tokens AS token
      USING purgeable
      WHERE token.id = purgeable.id
    `,
    [maintenanceBatchSize],
  );

  return result.rowCount ?? 0;
}

export async function purgeRedactedBlogCommentTombstones() {
  const result = await getPostgresPool().query(
    `
      WITH purgeable AS (
        SELECT id
        FROM comments.blog_comments
        WHERE status IN ('rejected', 'removed', 'expired')
          AND moderated_at <= now() - interval '12 months'
        ORDER BY moderated_at ASC, id ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      )
      DELETE FROM comments.blog_comments AS comment
      USING purgeable
      WHERE comment.id = purgeable.id
    `,
    [maintenanceBatchSize],
  );

  return result.rowCount ?? 0;
}

export async function maintainBlogCommentLifecycle(): Promise<BlogCommentLifecycleMaintenanceResult> {
  const expiredCount = await expirePendingBlogComments();
  const purgedTokenCount = await purgeBlogCommentTokens();
  const purgedCommentCount = await purgeRedactedBlogCommentTombstones();

  return { expiredCount, purgedTokenCount, purgedCommentCount };
}
