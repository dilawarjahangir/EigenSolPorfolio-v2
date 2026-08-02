import "server-only";

import { randomUUID } from "node:crypto";
import type {
  BlogCmsActor,
  BlogPublicationSchedule,
  BlogPublicationScheduleStatus,
  ScheduleBlogPublicationInput,
} from "@/contracts/blog-cms";
import { getPostgresPool } from "@/database/PostgresDatabase";
import {
  insertBlogPostAuditEvent,
  lockBlogSlugRegistryRecord,
  promoteBlogRevisionSlugRecord,
  releaseInactiveBlogSlugReservationsRecord,
} from "@/repositories/BlogPostRepository";

type ScheduleRow = {
  id: string;
  post_id: string;
  revision_id: string | null;
  action: "publish" | "unpublish";
  status: BlogPublicationScheduleStatus;
  execute_at: Date;
  expected_post_version: number;
  expected_status: "draft" | "published";
  expected_published_revision_id: string | null;
  attempt_count: number;
  claim_token: string | null;
  claimed_at: Date | null;
  completed_at: Date | null;
  last_error_code: string | null;
  created_at: Date;
  created_by: string;
};

type LockedPostRow = {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  version: number;
  current_revision_id: string;
  published_revision_id: string | null;
  first_published_at: Date | null;
};

export type BlogScheduleRepositoryResult =
  | Readonly<{ ok: true; value: BlogPublicationSchedule }>
  | Readonly<{
      ok: false;
      reason: "not-found" | "version-conflict" | "conflict" | "invalid-state";
      actualVersion?: number;
    }>;

export type ClaimedBlogPublication = Readonly<{
  schedule: BlogPublicationSchedule;
  claimToken: string;
}>;

export type ExecuteBlogPublicationResult =
  | Readonly<{ ok: true; slug: string }>
  | Readonly<{ ok: false; reason: "claim-lost" | "invalid-state" }>;

function mapSchedule(row: ScheduleRow): BlogPublicationSchedule {
  return {
    id: row.id,
    postId: row.post_id,
    revisionId: row.revision_id,
    action: row.action,
    status: row.status,
    executeAt: row.execute_at.toISOString(),
    expectedPostVersion: row.expected_post_version,
    expectedStatus: row.expected_status,
    expectedPublishedRevisionId: row.expected_published_revision_id,
    attemptCount: row.attempt_count,
    claimToken: row.claim_token,
    claimedAt: row.claimed_at?.toISOString() ?? null,
    completedAt: row.completed_at?.toISOString() ?? null,
    lastErrorCode: row.last_error_code,
    createdAt: row.created_at.toISOString(),
    createdBy: row.created_by,
  };
}

export async function findActiveBlogPublicationScheduleRecord(postId: string) {
  const result = await getPostgresPool().query<ScheduleRow>(
    `
      SELECT *
      FROM content.blog_publication_schedules
      WHERE post_id = $1 AND status IN ('pending', 'processing')
      LIMIT 1
    `,
    [postId],
  );

  return result.rows[0] ? mapSchedule(result.rows[0]) : null;
}

export async function createBlogPublicationScheduleRecord(
  input: ScheduleBlogPublicationInput,
): Promise<BlogScheduleRepositoryResult> {
  const client = await getPostgresPool().connect();
  const scheduleId = randomUUID();

  try {
    await client.query("BEGIN");
    const postResult = await client.query<LockedPostRow>(
      `SELECT * FROM content.blog_posts WHERE id = $1 FOR UPDATE`,
      [input.postId],
    );
    const post = postResult.rows[0];
    if (!post) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not-found" };
    }
    if (post.version !== input.expectedVersion) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "version-conflict", actualVersion: post.version };
    }
    if (post.status === "archived" || (input.action === "unpublish" && post.status !== "published")) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }
    if (input.action === "publish") {
      const revision = await client.query(
        `
          SELECT 1
          FROM content.blog_post_revisions
          WHERE post_id = $1 AND id = $2
          FOR KEY SHARE
        `,
        [post.id, input.revisionId],
      );
      if (revision.rowCount !== 1) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "invalid-state" };
      }
    }
    const active = await client.query(
      `
        SELECT 1
        FROM content.blog_publication_schedules
        WHERE post_id = $1 AND status IN ('pending', 'processing')
      `,
      [post.id],
    );
    if (active.rowCount !== 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "conflict" };
    }

    const result = await client.query<ScheduleRow>(
      `
        INSERT INTO content.blog_publication_schedules (
          id,
          post_id,
          revision_id,
          action,
          execute_at,
          expected_post_version,
          expected_status,
          expected_published_revision_id,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        scheduleId,
        post.id,
        input.action === "publish" ? input.revisionId : null,
        input.action,
        input.executeAt,
        input.expectedVersion,
        post.status,
        post.published_revision_id,
        input.actor.id,
      ],
    );
    await insertBlogPostAuditEvent(client, {
      postId: post.id,
      revisionId: input.action === "publish" ? input.revisionId : post.current_revision_id,
      action: "publication-scheduled",
      actorId: input.actor.id,
      details: {
        scheduleId,
        publicationAction: input.action,
        executeAt: input.executeAt,
      },
    });
    await client.query("COMMIT");
    return { ok: true, value: mapSchedule(result.rows[0]) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function cancelBlogPublicationScheduleRecord(
  scheduleId: string,
  actor: BlogCmsActor,
): Promise<BlogScheduleRepositoryResult> {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    await lockBlogSlugRegistryRecord(client);
    const existing = await client.query<ScheduleRow>(
      `SELECT * FROM content.blog_publication_schedules WHERE id = $1 FOR UPDATE`,
      [scheduleId],
    );
    const schedule = existing.rows[0];
    if (!schedule) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not-found" };
    }
    if (schedule.status !== "pending") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }

    const updated = await client.query<ScheduleRow>(
      `
        UPDATE content.blog_publication_schedules
        SET status = 'cancelled', updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [schedule.id],
    );
    await insertBlogPostAuditEvent(client, {
      postId: schedule.post_id,
      revisionId: schedule.revision_id,
      action: "schedule-cancelled",
      actorId: actor.id,
      details: { scheduleId: schedule.id },
    });
    await releaseInactiveBlogSlugReservationsRecord(client, schedule.post_id);
    await client.query("COMMIT");
    return { ok: true, value: mapSchedule(updated.rows[0]) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function claimDueBlogPublicationRecords(input: Readonly<{
  now: Date;
  limit: number;
}>) {
  const client = await getPostgresPool().connect();
  const claimed: ClaimedBlogPublication[] = [];

  try {
    await client.query("BEGIN");
    const due = await client.query<{ id: string }>(
      `
        SELECT id
        FROM content.blog_publication_schedules
        WHERE status = 'pending' AND execute_at <= $1
        ORDER BY execute_at ASC, id ASC
        LIMIT $2
        FOR UPDATE SKIP LOCKED
      `,
      [input.now, input.limit],
    );

    for (const item of due.rows) {
      const claimToken = randomUUID();
      const result = await client.query<ScheduleRow>(
        `
          UPDATE content.blog_publication_schedules
          SET
            status = 'processing',
            claim_token = $2,
            claimed_at = $3,
            attempt_count = attempt_count + 1,
            updated_at = $3
          WHERE id = $1
          RETURNING *
        `,
        [item.id, claimToken, input.now],
      );
      claimed.push({ schedule: mapSchedule(result.rows[0]), claimToken });
    }
    await client.query("COMMIT");
    return claimed;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function executeClaimedBlogPublicationRecord(input: Readonly<{
  scheduleId: string;
  claimToken: string;
  publishedAt: Date;
  actorId: string;
}>): Promise<ExecuteBlogPublicationResult> {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    await lockBlogSlugRegistryRecord(client);
    const scheduledPost = await client.query<{ post_id: string }>(
      `
        SELECT post_id
        FROM content.blog_publication_schedules
        WHERE id = $1 AND status = 'processing' AND claim_token = $2
      `,
      [input.scheduleId, input.claimToken],
    );
    if (!scheduledPost.rows[0]) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "claim-lost" };
    }

    const postResult = await client.query<LockedPostRow>(
      `SELECT * FROM content.blog_posts WHERE id = $1 FOR UPDATE`,
      [scheduledPost.rows[0].post_id],
    );
    const post = postResult.rows[0];
    if (!post) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }
    const scheduleResult = await client.query<ScheduleRow>(
      `
        SELECT *
        FROM content.blog_publication_schedules
        WHERE id = $1 AND status = 'processing' AND claim_token = $2
        FOR UPDATE
      `,
      [input.scheduleId, input.claimToken],
    );
    const schedule = scheduleResult.rows[0];
    if (!schedule) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "claim-lost" };
    }
    if (post.status === "archived") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }
    if (
      post.status !== schedule.expected_status ||
      post.published_revision_id !== schedule.expected_published_revision_id
    ) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }

    let resultingSlug = post.slug;
    if (schedule.action === "publish") {
      if (!schedule.revision_id) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "invalid-state" };
      }
      const promotion = await promoteBlogRevisionSlugRecord(client, {
        postId: post.id,
        currentSlug: post.slug,
        revisionId: schedule.revision_id,
      });
      if (!promotion.ok) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "invalid-state" };
      }
      resultingSlug = promotion.slug;
      await client.query(
        `
          UPDATE content.blog_posts
          SET
            status = 'published',
            slug = $5,
            published_revision_id = $2,
            first_published_at = COALESCE(first_published_at, $3::timestamptz),
            last_published_at = now(),
            content_modified_at = CASE
              WHEN first_published_at IS NULL THEN NULL
              WHEN published_revision_id IS DISTINCT FROM $2::uuid THEN now()
              ELSE content_modified_at
            END,
            version = version + 1,
            updated_at = now(),
            updated_by = $4
          WHERE id = $1
        `,
        [
          post.id,
          schedule.revision_id,
          input.publishedAt,
          input.actorId,
          resultingSlug,
        ],
      );
    } else {
      await client.query(
        `
          UPDATE content.blog_posts
          SET
            status = 'draft',
            version = version + 1,
            updated_at = now(),
            updated_by = $2
          WHERE id = $1
        `,
        [post.id, input.actorId],
      );
    }

    await client.query(
      `
        UPDATE content.blog_publication_schedules
        SET
          status = 'completed',
          claim_token = NULL,
          claimed_at = NULL,
          completed_at = now(),
          updated_at = now()
        WHERE id = $1
      `,
      [schedule.id],
    );
    await releaseInactiveBlogSlugReservationsRecord(client, post.id);
    await insertBlogPostAuditEvent(client, {
      postId: post.id,
      revisionId: schedule.revision_id ?? post.current_revision_id,
      action: schedule.action === "publish" ? "published" : "unpublished",
      actorId: input.actorId,
      details: {
        scheduleId: schedule.id,
        publishedAt: schedule.action === "publish" ? input.publishedAt.toISOString() : null,
      },
    });
    if (schedule.action === "publish" && resultingSlug !== post.slug) {
      await insertBlogPostAuditEvent(client, {
        postId: post.id,
        revisionId: schedule.revision_id,
        action: "slug-changed",
        actorId: input.actorId,
        details: { previousSlug: post.slug, slug: resultingSlug },
      });
    }
    await insertBlogPostAuditEvent(client, {
      postId: post.id,
      revisionId: schedule.revision_id ?? post.current_revision_id,
      action: "schedule-completed",
      actorId: input.actorId,
      details: { scheduleId: schedule.id },
    });
    await client.query("COMMIT");
    return { ok: true, slug: resultingSlug };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function failClaimedBlogPublicationRecord(input: Readonly<{
  scheduleId: string;
  claimToken: string;
  errorCode: string;
  retryAt: Date;
  maximumAttempts: number;
  actorId: string;
}>) {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    await lockBlogSlugRegistryRecord(client);
    const existing = await client.query<ScheduleRow>(
      `
        SELECT *
        FROM content.blog_publication_schedules
        WHERE id = $1 AND status = 'processing' AND claim_token = $2
        FOR UPDATE
      `,
      [input.scheduleId, input.claimToken],
    );
    const schedule = existing.rows[0];
    if (!schedule) {
      await client.query("ROLLBACK");
      return null;
    }
    const failed = schedule.attempt_count >= input.maximumAttempts;
    const result = await client.query<ScheduleRow>(
      `
        UPDATE content.blog_publication_schedules
        SET
          status = $2,
          execute_at = CASE WHEN $2 = 'pending' THEN $3 ELSE execute_at END,
          claim_token = NULL,
          claimed_at = NULL,
          last_error_code = $4,
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [schedule.id, failed ? "failed" : "pending", input.retryAt, input.errorCode],
    );
    if (failed) {
      await insertBlogPostAuditEvent(client, {
        postId: schedule.post_id,
        revisionId: schedule.revision_id,
        action: "schedule-failed",
        actorId: input.actorId,
        details: { scheduleId: schedule.id, errorCode: input.errorCode },
      });
      await releaseInactiveBlogSlugReservationsRecord(client, schedule.post_id);
    }
    await client.query("COMMIT");
    return mapSchedule(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function recoverStaleBlogPublicationRecords(input: Readonly<{
  staleBefore: Date;
  maximumAttempts: number;
  actorId: string;
}>) {
  const client = await getPostgresPool().connect();
  let recovered = 0;
  let failed = 0;

  try {
    await client.query("BEGIN");
    await lockBlogSlugRegistryRecord(client);
    const stale = await client.query<ScheduleRow>(
      `
        SELECT *
        FROM content.blog_publication_schedules
        WHERE status = 'processing' AND claimed_at < $1
        FOR UPDATE SKIP LOCKED
      `,
      [input.staleBefore],
    );

    for (const schedule of stale.rows) {
      const isFailed = schedule.attempt_count >= input.maximumAttempts;
      await client.query(
        `
          UPDATE content.blog_publication_schedules
          SET
            status = $2,
            claim_token = NULL,
            claimed_at = NULL,
            last_error_code = 'stale_claim',
            updated_at = now()
          WHERE id = $1
        `,
        [schedule.id, isFailed ? "failed" : "pending"],
      );
      if (isFailed) {
        failed += 1;
        await insertBlogPostAuditEvent(client, {
          postId: schedule.post_id,
          revisionId: schedule.revision_id,
          action: "schedule-failed",
          actorId: input.actorId,
          details: { scheduleId: schedule.id, errorCode: "stale_claim" },
        });
        await releaseInactiveBlogSlugReservationsRecord(client, schedule.post_id);
      } else {
        recovered += 1;
      }
    }
    await client.query("COMMIT");
    return { recovered, failed };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
