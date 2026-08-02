import "server-only";

import type { LegacyBlogCmsSeed } from "@/contracts/blog-cms";
import { getPostgresPool } from "@/database/PostgresDatabase";
import {
  insertBlogPostAuditEvent,
  insertBlogPostRevisionRecord,
} from "@/repositories/BlogPostRepository";

export async function seedLegacyBlogPostRecords(
  seed: LegacyBlogCmsSeed,
  actorId: string,
) {
  const client = await getPostgresPool().connect();
  let insertedPosts = 0;
  let existingPosts = 0;

  try {
    await client.query("BEGIN");

    for (const asset of seed.mediaAssets) {
      await client.query(
        `
          INSERT INTO content.blog_media_assets (
            id,
            storage_kind,
            storage_key,
            public_url,
            original_filename,
            mime_type,
            width,
            height,
            byte_size,
            checksum_sha256,
            created_by
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          asset.id,
          asset.storageKind,
          asset.storageKey,
          asset.publicUrl,
          asset.originalFilename,
          asset.mimeType,
          asset.width ?? null,
          asset.height ?? null,
          asset.byteSize ?? null,
          asset.checksumSha256 ?? null,
          actorId,
        ],
      );
    }

    for (const post of seed.posts) {
      const existing = await client.query<{ id: string; slug: string }>(
        `SELECT id, slug FROM content.blog_posts WHERE id = $1 OR slug = $2 FOR UPDATE`,
        [post.postId, post.slug],
      );
      if (existing.rowCount !== 0) {
        const matchingId = existing.rows.find((row) => row.id === post.postId);
        const matchingSlug = existing.rows.find((row) => row.slug === post.slug);

        // A seeded post may later be edited through the CMS, including a slug
        // change. Its stable post ID still identifies the existing seed record.
        if (matchingId) {
          if (matchingSlug && matchingSlug.id !== post.postId) {
            throw new Error("A legacy blog seed identifier conflicts with an existing post");
          }
          existingPosts += 1;
          continue;
        }

        throw new Error("A legacy blog seed identifier conflicts with an existing post");
      }

      await client.query(
        `
          INSERT INTO content.blog_posts (
            id,
            slug,
            status,
            version,
            current_revision_id,
            published_revision_id,
            first_published_at,
            created_by,
            updated_by
          )
          VALUES ($1, $2, 'published', 1, $3, $3, $4::timestamptz, $5, $5)
        `,
        [post.postId, post.slug, post.revisionId, post.publishedAt, actorId],
      );
      await insertBlogPostRevisionRecord(
        client,
        post.postId,
        post.revisionId,
        1,
        post.slug,
        post.revision,
        actorId,
      );
      await client.query(
        `
          INSERT INTO content.blog_post_slugs (
            slug,
            post_id,
            revision_id,
            kind,
            created_by
          )
          VALUES ($1, $2, $3, 'current', $4)
        `,
        [post.slug, post.postId, post.revisionId, actorId],
      );
      await insertBlogPostAuditEvent(client, {
        postId: post.postId,
        revisionId: post.revisionId,
        action: "legacy-seeded",
        actorId,
        details: { slug: post.slug, publishedAt: post.publishedAt },
      });
      insertedPosts += 1;
    }

    await client.query("COMMIT");
    return { insertedPosts, existingPosts };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
