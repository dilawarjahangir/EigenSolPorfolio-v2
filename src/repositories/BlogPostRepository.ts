import "server-only";

import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type {
  BlogAuditAction,
  BlogCmsActor,
  BlogEditorNode,
  BlogJsonObject,
  BlogPostMutationResult,
  BlogPostRevisionInput,
  BlogPostStatus,
  CreateBlogPostDraftInput,
  UpdateBlogPostDraftInput,
} from "@/contracts/blog-cms";
import { getPostgresPool } from "@/database/PostgresDatabase";

type LockedPostRow = {
  id: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  current_revision_id: string;
  current_revision_slug: string;
  published_revision_id: string | null;
  first_published_at: Date | null;
};

type MutationRow = {
  id: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  current_revision_id: string;
  published_revision_id: string | null;
};

export type BlogPostRepositoryFailure =
  | "not-found"
  | "version-conflict"
  | "slug-conflict"
  | "revision-not-found"
  | "invalid-state";

export type BlogPostRepositoryResult =
  | Readonly<{ ok: true; value: BlogPostMutationResult }>
  | Readonly<{ ok: false; reason: BlogPostRepositoryFailure; actualVersion?: number }>;

function mapMutation(row: MutationRow): BlogPostMutationResult {
  return {
    postId: row.id,
    slug: row.slug,
    status: row.status,
    version: row.version,
    currentRevisionId: row.current_revision_id,
    publishedRevisionId: row.published_revision_id,
  };
}

export async function lockBlogSlugRegistryRecord(client: PoolClient) {
  await client.query("SELECT pg_advisory_xact_lock(hashtext('content.blog-post-slugs'))");
}

export async function releaseInactiveBlogSlugReservationsRecord(
  client: PoolClient,
  postId: string,
) {
  return client.query(
    `
      DELETE FROM content.blog_post_slugs AS slug
      WHERE slug.post_id = $1
        AND slug.kind = 'reserved'
        AND NOT EXISTS (
          SELECT 1
          FROM content.blog_posts AS post
          WHERE post.id = slug.post_id
            AND post.current_revision_id = slug.revision_id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM content.blog_publication_schedules AS schedule
          WHERE schedule.post_id = slug.post_id
            AND schedule.revision_id = slug.revision_id
            AND schedule.status IN ('pending', 'processing')
        )
    `,
    [postId],
  );
}

async function slugIsUnavailable(client: PoolClient, slug: string, postId?: string) {
  const result = await client.query(
    `
      SELECT 1
      FROM content.blog_post_slugs
      WHERE slug = $1 AND ($2::uuid IS NULL OR post_id <> $2::uuid)
      LIMIT 1
    `,
    [slug, postId ?? null],
  );

  return result.rowCount !== 0;
}

type RevisionAssetRow = {
  id: string;
  public_url: string;
  width: number | null;
  height: number | null;
};

function assertStoredImageAttributes(
  attributes: BlogJsonObject,
  bodyAssets: ReadonlyMap<string, RevisionAssetRow>,
) {
  const assetId = attributes.assetId;
  const asset = typeof assetId === "string" ? bodyAssets.get(assetId) : undefined;
  if (!asset) throw new Error("Editor content references media outside the revision body assets");
  if (attributes.src !== asset.public_url) {
    throw new Error("Editor image source does not match its registered media asset");
  }
  if (
    asset.width === null ||
    asset.height === null ||
    attributes.width !== asset.width ||
    attributes.height !== asset.height
  ) {
    throw new Error("Editor image dimensions do not match its registered media asset");
  }
}

function assertEditorMediaIntegrity(
  node: BlogEditorNode,
  bodyAssets: ReadonlyMap<string, RevisionAssetRow>,
) {
  if (node.type === "image") {
    assertStoredImageAttributes(node.attrs ?? {}, bodyAssets);
  } else if (node.type === "managedGallery") {
    const items = node.attrs?.items;
    if (!Array.isArray(items)) throw new Error("Managed gallery items are invalid");
    for (const item of items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new Error("Managed gallery image attributes are invalid");
      }
      assertStoredImageAttributes(item as BlogJsonObject, bodyAssets);
    }
  }

  for (const child of node.content ?? []) assertEditorMediaIntegrity(child, bodyAssets);
}

export async function insertBlogPostRevisionRecord(
  client: PoolClient,
  postId: string,
  revisionId: string,
  revisionNumber: number,
  slug: string,
  revision: BlogPostRevisionInput,
  actorId: string,
) {
  const mediaIds = [...new Set(revision.media.map((reference) => reference.mediaId))];
  const assets = mediaIds.length
    ? await client.query<RevisionAssetRow>(
        `
          SELECT id, public_url, width, height
          FROM content.blog_media_assets
          WHERE id = ANY($1::uuid[]) AND trashed_at IS NULL
          FOR KEY SHARE
        `,
        [mediaIds],
      )
    : { rows: [] as RevisionAssetRow[] };
  if (assets.rows.length !== mediaIds.length) {
    throw new Error("A blog revision referenced a missing or trashed media asset");
  }
  const assetsById = new Map(assets.rows.map((asset) => [asset.id, asset]));
  const bodyAssets = new Map(
    revision.media
      .filter((reference) => reference.role === "body")
      .map((reference) => [reference.mediaId, assetsById.get(reference.mediaId)!] as const),
  );
  assertEditorMediaIntegrity(revision.content.doc, bodyAssets);

  await client.query(
    `
      INSERT INTO content.blog_post_revisions (
        id,
        post_id,
        revision_number,
        slug,
        title,
        excerpt,
        category,
        content_document,
        tags,
        author_name,
        author_role,
        author_bio,
        video_id,
        seo_title,
        seo_description,
        read_time_minutes,
        created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::text[], $10, $11, $12, $13, $14, $15, $16, $17
      )
    `,
    [
      revisionId,
      postId,
      revisionNumber,
      slug,
      revision.title,
      revision.excerpt,
      revision.category,
      JSON.stringify(revision.content),
      [...revision.tags],
      revision.author,
      revision.authorRole,
      revision.authorBio,
      revision.videoId ?? null,
      revision.seoTitle ?? null,
      revision.seoDescription ?? null,
      revision.readTimeMinutes,
      actorId,
    ],
  );

  for (const media of revision.media) {
    await client.query(
      `
        INSERT INTO content.blog_revision_media (
          revision_id,
          media_asset_id,
          role,
          position,
          alt_text,
          decorative,
          caption
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        revisionId,
        media.mediaId,
        media.role,
        media.position,
        media.altText,
        media.decorative,
        media.caption ?? null,
      ],
    );
  }
}

export async function insertBlogPostAuditEvent(
  client: PoolClient,
  input: Readonly<{
    postId: string;
    revisionId?: string | null;
    action: BlogAuditAction;
    actorId: string;
    details?: BlogJsonObject;
  }>,
) {
  await client.query(
    `
      INSERT INTO content.blog_post_audit_events (
        id,
        post_id,
        revision_id,
        action,
        actor_id,
        details
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    `,
    [
      randomUUID(),
      input.postId,
      input.revisionId ?? null,
      input.action,
      input.actorId,
      JSON.stringify(input.details ?? {}),
    ],
  );
}

async function lockPost(client: PoolClient, postId: string) {
  const result = await client.query<LockedPostRow>(
    `
      SELECT
        id,
        slug,
        status,
        version,
        current_revision_id,
        (SELECT slug FROM content.blog_post_revisions WHERE id = current_revision_id)
          AS current_revision_slug,
        published_revision_id,
        first_published_at
      FROM content.blog_posts
      WHERE id = $1
      FOR UPDATE
    `,
    [postId],
  );

  return result.rows[0] ?? null;
}

async function mutationRow(client: PoolClient, postId: string) {
  const result = await client.query<MutationRow>(
    `
      SELECT id, slug, status, version, current_revision_id, published_revision_id
      FROM content.blog_posts
      WHERE id = $1
    `,
    [postId],
  );

  return result.rows[0];
}

export async function createBlogPostDraftRecord(
  input: CreateBlogPostDraftInput,
): Promise<BlogPostRepositoryResult> {
  const client = await getPostgresPool().connect();
  const postId = randomUUID();
  const revisionId = randomUUID();

  try {
    await client.query("BEGIN");
    await lockBlogSlugRegistryRecord(client);

    if (await slugIsUnavailable(client, input.slug)) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "slug-conflict" };
    }

    await client.query(
      `
        INSERT INTO content.blog_posts (
          id,
          slug,
          status,
          version,
          current_revision_id,
          created_by,
          updated_by
        )
        VALUES ($1, $2, 'draft', 1, $3, $4, $4)
      `,
      [postId, input.slug, revisionId, input.actor.id],
    );
    await insertBlogPostRevisionRecord(
      client,
      postId,
      revisionId,
      1,
      input.slug,
      input.revision,
      input.actor.id,
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
        VALUES ($1, $2, $3, 'reserved', $4)
      `,
      [input.slug, postId, revisionId, input.actor.id],
    );
    await insertBlogPostAuditEvent(client, {
      postId,
      revisionId,
      action: "created",
      actorId: input.actor.id,
      details: { slug: input.slug },
    });
    await client.query("COMMIT");

    return {
      ok: true,
      value: {
        postId,
        slug: input.slug,
        status: "draft",
        version: 1,
        currentRevisionId: revisionId,
        publishedRevisionId: null,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateBlogPostDraftRecord(
  input: UpdateBlogPostDraftInput,
): Promise<BlogPostRepositoryResult> {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    await lockBlogSlugRegistryRecord(client);
    const post = await lockPost(client, input.postId);

    if (!post) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not-found" };
    }
    if (post.version !== input.expectedVersion) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "version-conflict", actualVersion: post.version };
    }
    if (post.status === "archived") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }

    const nextSlug = input.slug ?? post.current_revision_slug;
    if (await slugIsUnavailable(client, nextSlug, post.id)) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "slug-conflict" };
    }

    const revisionNumberResult = await client.query<{ revision_number: number }>(
      `
        SELECT COALESCE(MAX(revision_number), 0) + 1 AS revision_number
        FROM content.blog_post_revisions
        WHERE post_id = $1
      `,
      [post.id],
    );
    const revisionNumber = revisionNumberResult.rows[0].revision_number;
    const revisionId = randomUUID();
    await insertBlogPostRevisionRecord(
      client,
      post.id,
      revisionId,
      revisionNumber,
      nextSlug,
      input.revision,
      input.actor.id,
    );
    const targetSlug = await client.query<{ kind: "current" | "reserved" | "historical" }>(
      `SELECT kind FROM content.blog_post_slugs WHERE slug = $1 AND post_id = $2 FOR UPDATE`,
      [nextSlug, post.id],
    );
    if (!targetSlug.rows[0]) {
      await client.query(
        `
          INSERT INTO content.blog_post_slugs (
            slug,
            post_id,
            revision_id,
            kind,
            created_by
          )
          VALUES ($1, $2, $3, 'reserved', $4)
        `,
        [nextSlug, post.id, revisionId, input.actor.id],
      );
    } else if (targetSlug.rows[0].kind === "reserved") {
      await client.query(
        `
          UPDATE content.blog_post_slugs
          SET revision_id = $2, updated_at = now()
          WHERE slug = $1 AND post_id = $3
        `,
        [nextSlug, revisionId, post.id],
      );
    }
    await client.query(
      `
        DELETE FROM content.blog_post_slugs AS slug
        WHERE slug.post_id = $1
          AND slug.kind = 'reserved'
          AND slug.slug <> $2
          AND NOT EXISTS (
            SELECT 1
            FROM content.blog_publication_schedules AS schedule
            WHERE schedule.post_id = slug.post_id
              AND schedule.revision_id = slug.revision_id
              AND schedule.status IN ('pending', 'processing')
          )
      `,
      [post.id, nextSlug],
    );
    await client.query(
      `
        UPDATE content.blog_posts
        SET
          slug = CASE WHEN first_published_at IS NULL THEN $2 ELSE slug END,
          current_revision_id = $3,
          version = version + 1,
          updated_at = now(),
          updated_by = $4
        WHERE id = $1
      `,
      [post.id, nextSlug, revisionId, input.actor.id],
    );
    await insertBlogPostAuditEvent(client, {
      postId: post.id,
      revisionId,
      action: "revision-created",
      actorId: input.actor.id,
      details: { revisionNumber },
    });
    if (post.first_published_at === null && nextSlug !== post.slug) {
      await insertBlogPostAuditEvent(client, {
        postId: post.id,
        revisionId,
        action: "slug-changed",
        actorId: input.actor.id,
        details: { previousSlug: post.slug, slug: nextSlug },
      });
    }
    const value = mapMutation(await mutationRow(client, post.id));
    await client.query("COMMIT");

    return { ok: true, value };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function findRevisionSlug(
  client: PoolClient,
  postId: string,
  revisionId: string,
) {
  const result = await client.query<{ slug: string }>(
    `
      SELECT slug
      FROM content.blog_post_revisions
      WHERE post_id = $1 AND id = $2
      FOR KEY SHARE
    `,
    [postId, revisionId],
  );
  return result.rows[0]?.slug ?? null;
}

export async function promoteBlogRevisionSlugRecord(
  client: PoolClient,
  input: Readonly<{
    postId: string;
    currentSlug: string;
    revisionId: string;
  }>,
): Promise<
  | Readonly<{ ok: true; slug: string }>
  | Readonly<{ ok: false; reason: "revision-not-found" | "slug-conflict" }>
> {
  const revisionSlug = await findRevisionSlug(client, input.postId, input.revisionId);
  if (!revisionSlug) return { ok: false, reason: "revision-not-found" };
  if (await slugIsUnavailable(client, revisionSlug, input.postId)) {
    return { ok: false, reason: "slug-conflict" };
  }

  if (revisionSlug !== input.currentSlug) {
    await client.query(
      `
        UPDATE content.blog_post_slugs
        SET kind = 'historical', updated_at = now()
        WHERE post_id = $1 AND kind = 'current'
      `,
      [input.postId],
    );
  }
  const promoted = await client.query(
    `
      UPDATE content.blog_post_slugs
      SET kind = 'current', revision_id = $3, updated_at = now()
      WHERE slug = $1 AND post_id = $2
    `,
    [revisionSlug, input.postId, input.revisionId],
  );
  return promoted.rowCount === 1
    ? { ok: true, slug: revisionSlug }
    : { ok: false, reason: "slug-conflict" };
}

export async function publishBlogPostRevisionRecord(input: Readonly<{
  postId: string;
  expectedVersion: number;
  revisionId: string;
  publishedAt: Date;
  actor: BlogCmsActor;
}>): Promise<BlogPostRepositoryResult> {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    await lockBlogSlugRegistryRecord(client);
    const post = await lockPost(client, input.postId);
    if (!post) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not-found" };
    }
    if (post.version !== input.expectedVersion) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "version-conflict", actualVersion: post.version };
    }
    if (post.status === "archived") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }
    const promotion = await promoteBlogRevisionSlugRecord(client, {
      postId: post.id,
      currentSlug: post.slug,
      revisionId: input.revisionId,
    });
    if (!promotion.ok) {
      await client.query("ROLLBACK");
      return { ok: false, reason: promotion.reason };
    }
    const revisionSlug = promotion.slug;

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
      [post.id, input.revisionId, input.publishedAt, input.actor.id, revisionSlug],
    );
    await insertBlogPostAuditEvent(client, {
      postId: post.id,
      revisionId: input.revisionId,
      action: "published",
      actorId: input.actor.id,
      details: { publishedAt: input.publishedAt.toISOString() },
    });
    if (revisionSlug !== post.slug) {
      await insertBlogPostAuditEvent(client, {
        postId: post.id,
        revisionId: input.revisionId,
        action: "slug-changed",
        actorId: input.actor.id,
        details: { previousSlug: post.slug, slug: revisionSlug },
      });
    }
    const value = mapMutation(await mutationRow(client, post.id));
    await client.query("COMMIT");

    return { ok: true, value };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function changePostStatus(input: Readonly<{
  postId: string;
  expectedVersion: number;
  status: BlogPostStatus;
  action: BlogAuditAction;
  actor: BlogCmsActor;
}>): Promise<BlogPostRepositoryResult> {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    await lockBlogSlugRegistryRecord(client);
    const post = await lockPost(client, input.postId);
    if (!post) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not-found" };
    }
    if (post.version !== input.expectedVersion) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "version-conflict", actualVersion: post.version };
    }
    if (
      (input.action === "unpublished" && post.status !== "published") ||
      (input.action === "archived" && post.status === "archived")
    ) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }

    await client.query(
      `
        UPDATE content.blog_posts
        SET
          status = $2,
          archived_at = CASE WHEN $2 = 'archived' THEN now() ELSE NULL END,
          version = version + 1,
          updated_at = now(),
          updated_by = $3
        WHERE id = $1
      `,
      [post.id, input.status, input.actor.id],
    );
    if (input.status === "archived") {
      await client.query(
        `
          UPDATE content.blog_publication_schedules
          SET
            status = 'cancelled',
            claim_token = NULL,
            claimed_at = NULL,
            updated_at = now(),
            last_error_code = 'post_archived'
          WHERE post_id = $1 AND status IN ('pending', 'processing')
        `,
        [post.id],
      );
      await releaseInactiveBlogSlugReservationsRecord(client, post.id);
    }
    await insertBlogPostAuditEvent(client, {
      postId: post.id,
      revisionId: post.current_revision_id,
      action: input.action,
      actorId: input.actor.id,
    });
    const value = mapMutation(await mutationRow(client, post.id));
    await client.query("COMMIT");

    return { ok: true, value };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function unpublishBlogPostRecord(input: Readonly<{
  postId: string;
  expectedVersion: number;
  actor: BlogCmsActor;
}>) {
  return changePostStatus({ ...input, status: "draft", action: "unpublished" });
}

export function archiveBlogPostRecord(input: Readonly<{
  postId: string;
  expectedVersion: number;
  actor: BlogCmsActor;
}>) {
  return changePostStatus({ ...input, status: "archived", action: "archived" });
}

export function restoreBlogPostRecord(input: Readonly<{
  postId: string;
  expectedVersion: number;
  actor: BlogCmsActor;
}>) {
  return restoreArchivedBlogPostRecord(input);
}

async function restoreArchivedBlogPostRecord(input: Readonly<{
  postId: string;
  expectedVersion: number;
  actor: BlogCmsActor;
}>): Promise<BlogPostRepositoryResult> {
  const client = await getPostgresPool().connect();

  try {
    await client.query("BEGIN");
    const post = await lockPost(client, input.postId);
    if (!post) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not-found" };
    }
    if (post.version !== input.expectedVersion) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "version-conflict", actualVersion: post.version };
    }
    if (post.status !== "archived") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid-state" };
    }

    const restoredStatus: Exclude<BlogPostStatus, "archived"> =
      post.published_revision_id === null ? "draft" : "published";
    await client.query(
      `
        UPDATE content.blog_posts
        SET
          status = $2,
          archived_at = NULL,
          last_published_at = CASE WHEN $2 = 'published' THEN now() ELSE last_published_at END,
          version = version + 1,
          updated_at = now(),
          updated_by = $3
        WHERE id = $1
      `,
      [post.id, restoredStatus, input.actor.id],
    );
    await insertBlogPostAuditEvent(client, {
      postId: post.id,
      revisionId: post.published_revision_id ?? post.current_revision_id,
      action: "restored",
      actorId: input.actor.id,
      details: { restoredStatus },
    });
    const value = mapMutation(await mutationRow(client, post.id));
    await client.query("COMMIT");
    return { ok: true, value };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
