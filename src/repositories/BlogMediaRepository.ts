import "server-only";

import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type {
  BlogCmsActor,
  BlogJsonObject,
  BlogMediaAsset,
  BlogMediaAssetInput,
  BlogMediaPurgeCandidate,
  BlogMediaStorageKind,
} from "@/contracts/blog-cms";
import { getPostgresPool } from "@/database/PostgresDatabase";

type MediaRow = {
  id: string;
  storage_kind: BlogMediaStorageKind;
  storage_key: string;
  public_url: string;
  original_filename: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  byte_size: string | null;
  checksum_sha256: string | null;
  created_at: Date;
  created_by: string;
  trashed_at: Date | null;
};

export type BlogMediaRepositoryCursor = Readonly<{
  createdAt: Date;
  id: string;
}>;

export type BlogMediaRepositoryResult =
  | Readonly<{ ok: true; value: BlogMediaAsset }>
  | Readonly<{ ok: false; reason: "not-found" | "conflict" | "referenced" }>;

function mapMedia(row: MediaRow): BlogMediaAsset {
  return {
    id: row.id,
    storageKind: row.storage_kind,
    storageKey: row.storage_key,
    publicUrl: row.public_url,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
    byteSize: row.byte_size === null ? null : Number(row.byte_size),
    checksumSha256: row.checksum_sha256,
    createdAt: row.created_at.toISOString(),
    createdBy: row.created_by,
    trashedAt: row.trashed_at?.toISOString() ?? null,
  };
}

async function insertMediaAuditEvent(
  client: PoolClient,
  input: Readonly<{
    mediaAssetId: string;
    action: "registered" | "trashed" | "auto-trashed";
    actorId: string;
    details?: BlogJsonObject;
  }>,
) {
  await client.query(
    `
      INSERT INTO content.blog_media_audit_events (
        id,
        media_asset_id,
        action,
        actor_id,
        details
      )
      VALUES ($1, $2, $3, $4, $5::jsonb)
    `,
    [
      randomUUID(),
      input.mediaAssetId,
      input.action,
      input.actorId,
      JSON.stringify(input.details ?? {}),
    ],
  );
}

export async function registerBlogMediaAssetRecord(
  input: BlogMediaAssetInput,
  actor: BlogCmsActor,
): Promise<BlogMediaRepositoryResult> {
  const client = await getPostgresPool().connect();
  const id = input.id ?? randomUUID();

  try {
    await client.query("BEGIN");
    const result = await client.query<MediaRow>(
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
        ON CONFLICT (storage_key) DO NOTHING
        RETURNING *
      `,
      [
        id,
        input.storageKind,
        input.storageKey,
        input.publicUrl,
        input.originalFilename,
        input.mimeType,
        input.width ?? null,
        input.height ?? null,
        input.byteSize ?? null,
        input.checksumSha256 ?? null,
        actor.id,
      ],
    );
    const row = result.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "conflict" };
    }

    await insertMediaAuditEvent(client, {
      mediaAssetId: row.id,
      action: "registered",
      actorId: actor.id,
      details: { storageKind: row.storage_kind },
    });
    await client.query("COMMIT");
    return { ok: true, value: mapMedia(row) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findActiveBlogMediaAssetByStorageKeyRecord(storageKey: string) {
  const result = await getPostgresPool().query<MediaRow>(
    `
      SELECT *
      FROM content.blog_media_assets
      WHERE storage_key = $1 AND trashed_at IS NULL
    `,
    [storageKey],
  );

  return result.rows[0] ? mapMedia(result.rows[0]) : null;
}

export async function listBlogMediaAssetRecords(input: Readonly<{
  includeTrashed: boolean;
  limit: number;
  cursor?: BlogMediaRepositoryCursor;
}>) {
  const result = await getPostgresPool().query<MediaRow>(
    `
      SELECT *
      FROM content.blog_media_assets
      WHERE ($1::boolean OR trashed_at IS NULL)
        AND (
          $2::timestamptz IS NULL
          OR (created_at, id) < ($2::timestamptz, $3::uuid)
        )
      ORDER BY created_at DESC, id DESC
      LIMIT $4
    `,
    [
      input.includeTrashed,
      input.cursor?.createdAt ?? null,
      input.cursor?.id ?? null,
      input.limit,
    ],
  );

  return result.rows.map(mapMedia);
}

export async function trashBlogMediaAssetRecord(
  mediaId: string,
  actor: BlogCmsActor,
): Promise<BlogMediaRepositoryResult> {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    const assetResult = await client.query<MediaRow>(
      `SELECT * FROM content.blog_media_assets WHERE id = $1 FOR UPDATE`,
      [mediaId],
    );
    const asset = assetResult.rows[0];
    if (!asset) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not-found" };
    }

    const reference = await client.query(
      `SELECT 1 FROM content.blog_revision_media WHERE media_asset_id = $1 LIMIT 1`,
      [mediaId],
    );
    if (reference.rowCount !== 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "referenced" };
    }

    const updated = await client.query<MediaRow>(
      `
        UPDATE content.blog_media_assets
        SET trashed_at = COALESCE(trashed_at, now())
        WHERE id = $1
        RETURNING *
      `,
      [mediaId],
    );
    await insertMediaAuditEvent(client, {
      mediaAssetId: mediaId,
      action: "trashed",
      actorId: actor.id,
    });
    await client.query("COMMIT");
    return { ok: true, value: mapMedia(updated.rows[0]) };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function autoTrashOrphanedBlogMediaRecords(input: Readonly<{
  olderThan: Date;
  limit: number;
  actorId: string;
}>) {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    const result = await client.query<MediaRow>(
      `
        WITH candidates AS (
          SELECT asset.id
          FROM content.blog_media_assets AS asset
          WHERE asset.storage_kind = 'managed'
            AND asset.trashed_at IS NULL
            AND asset.created_at < $1
            AND NOT EXISTS (
              SELECT 1
              FROM content.blog_revision_media AS reference
              WHERE reference.media_asset_id = asset.id
            )
          ORDER BY asset.created_at ASC, asset.id ASC
          LIMIT $2
          FOR UPDATE OF asset SKIP LOCKED
        )
        UPDATE content.blog_media_assets AS asset
        SET trashed_at = now()
        FROM candidates
        WHERE asset.id = candidates.id
        RETURNING asset.*
      `,
      [input.olderThan, input.limit],
    );

    for (const asset of result.rows) {
      await insertMediaAuditEvent(client, {
        mediaAssetId: asset.id,
        action: "auto-trashed",
        actorId: input.actorId,
      });
    }
    await client.query("COMMIT");
    return result.rows.map(mapMedia);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listPurgeableBlogMediaAssetRecords(input: Readonly<{
  trashedBefore: Date;
  limit: number;
}>): Promise<readonly BlogMediaPurgeCandidate[]> {
  const result = await getPostgresPool().query<{
    id: string;
    storage_key: string;
    trashed_at: Date;
  }>(
    `
      SELECT asset.id, asset.storage_key, asset.trashed_at
      FROM content.blog_media_assets AS asset
      WHERE asset.storage_kind = 'managed'
        AND asset.trashed_at IS NOT NULL
        AND asset.trashed_at <= $1
        AND NOT EXISTS (
          SELECT 1
          FROM content.blog_revision_media AS reference
          WHERE reference.media_asset_id = asset.id
        )
      ORDER BY asset.trashed_at ASC, asset.id ASC
      LIMIT $2
    `,
    [input.trashedBefore, input.limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    storageKey: row.storage_key,
    trashedAt: row.trashed_at.toISOString(),
  }));
}

export async function finalizeBlogMediaAssetPurgeRecord(input: Readonly<{
  mediaId: string;
  storageKey: string;
  trashedBefore: Date;
}>) {
  const result = await getPostgresPool().query<{ id: string }>(
    `
      DELETE FROM content.blog_media_assets AS asset
      WHERE asset.id = $1
        AND asset.storage_key = $2
        AND asset.storage_kind = 'managed'
        AND asset.trashed_at IS NOT NULL
        AND asset.trashed_at <= $3
        AND NOT EXISTS (
          SELECT 1
          FROM content.blog_revision_media AS reference
          WHERE reference.media_asset_id = asset.id
        )
      RETURNING asset.id
    `,
    [input.mediaId, input.storageKey, input.trashedBefore],
  );

  return result.rowCount === 1;
}
