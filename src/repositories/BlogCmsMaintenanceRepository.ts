import "server-only";

import type { BlogJsonValue } from "@/contracts/blog-cms";
import { getPostgresPool } from "@/database/PostgresDatabase";
import { insertBlogPostAuditEvent } from "@/repositories/BlogPostRepository";

type RevisionRetentionCandidate = {
  id: string;
  post_id: string;
  revision_number: number;
};

export async function pruneBlogPostRevisionRecords(input: Readonly<{
  retainOtherRevisions: number;
  limit: number;
  actorId: string;
}>) {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    const candidates = await client.query<RevisionRetentionCandidate>(
      `
        WITH ranked_other_revisions AS (
          SELECT
            revision.id,
            revision.post_id,
            revision.revision_number,
            row_number() OVER (
              PARTITION BY revision.post_id
              ORDER BY revision.revision_number DESC
            ) AS retention_rank
          FROM content.blog_post_revisions AS revision
          INNER JOIN content.blog_posts AS post ON post.id = revision.post_id
          WHERE revision.id <> post.current_revision_id
            AND revision.id IS DISTINCT FROM post.published_revision_id
            AND NOT EXISTS (
              SELECT 1
              FROM content.blog_publication_schedules AS schedule
              WHERE (
                  schedule.revision_id = revision.id
                  OR schedule.expected_published_revision_id = revision.id
                )
                AND schedule.status IN ('pending', 'processing')
            )
        )
        SELECT revision.id, revision.post_id, revision.revision_number
        FROM content.blog_post_revisions AS revision
        INNER JOIN ranked_other_revisions AS ranked ON ranked.id = revision.id
        WHERE ranked.retention_rank > $1
        ORDER BY revision.post_id ASC, revision.revision_number ASC
        LIMIT $2
        FOR UPDATE OF revision SKIP LOCKED
      `,
      [input.retainOtherRevisions, input.limit],
    );
    if (candidates.rowCount === 0) {
      await client.query("COMMIT");
      return 0;
    }

    const candidateIds = candidates.rows.map((candidate) => candidate.id);
    await client.query(
      `DELETE FROM content.blog_revision_media WHERE revision_id = ANY($1::uuid[])`,
      [candidateIds],
    );
    await client.query(
      `DELETE FROM content.blog_post_audit_events WHERE revision_id = ANY($1::uuid[])`,
      [candidateIds],
    );
    const deleted = await client.query<RevisionRetentionCandidate>(
      `
        DELETE FROM content.blog_post_revisions AS revision
        WHERE revision.id = ANY($1::uuid[])
          AND NOT EXISTS (
            SELECT 1
            FROM content.blog_posts AS post
            WHERE post.current_revision_id = revision.id
              OR post.published_revision_id = revision.id
          )
          AND NOT EXISTS (
            SELECT 1
            FROM content.blog_publication_schedules AS schedule
            WHERE (
                schedule.revision_id = revision.id
                OR schedule.expected_published_revision_id = revision.id
              )
              AND schedule.status IN ('pending', 'processing')
          )
        RETURNING revision.id, revision.post_id, revision.revision_number
      `,
      [candidateIds],
    );

    const deletedByPost = new Map<string, number[]>();
    for (const revision of deleted.rows) {
      const numbers = deletedByPost.get(revision.post_id) ?? [];
      numbers.push(revision.revision_number);
      deletedByPost.set(revision.post_id, numbers);
    }
    for (const [postId, revisionNumbers] of deletedByPost) {
      await insertBlogPostAuditEvent(client, {
        postId,
        action: "revision-pruned",
        actorId: input.actorId,
        details: {
          count: revisionNumbers.length,
          revisionNumbers: revisionNumbers as readonly BlogJsonValue[],
        },
      });
    }

    await client.query("COMMIT");
    return deleted.rowCount ?? 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
