import "server-only";

import type {
  BlogEditorDocument,
  BlogPostAdminRecord,
  BlogPostPage,
  BlogPostReference,
  BlogPostRevision,
  BlogPostStatus,
  BlogPostSummary,
  BlogRevisionMedia,
  BlogSitemapEntry,
  BlogSlugResolution,
} from "@/contracts/blog-cms";
import { getPostgresPool } from "@/database/PostgresDatabase";

type PublishedPostRow = {
  id: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  revision_id: string;
  title: string;
  excerpt: string;
  category: string;
  content_document: BlogEditorDocument;
  tags: string[];
  author_name: string;
  author_role: string;
  author_bio: string;
  video_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  read_time_minutes: number;
  first_published_at: Date;
  content_modified_at: Date | null;
  revision_created_at: Date;
  revision_created_by: string;
  author_media: BlogRevisionMedia | null;
  author_profile_media: BlogRevisionMedia | null;
  cover_media: BlogRevisionMedia | null;
  hero_media: BlogRevisionMedia | null;
  social_media: BlogRevisionMedia | null;
  total_count?: string;
};

type AdminPostRow = {
  id: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  current_revision_id: string;
  published_revision_id: string | null;
  first_published_at: Date | null;
  content_modified_at: Date | null;
  created_at: Date;
  updated_at: Date;
  archived_at: Date | null;
};

type RevisionRow = {
  id: string;
  post_id: string;
  revision_number: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  content_document: BlogEditorDocument;
  tags: string[];
  author_name: string;
  author_role: string;
  author_bio: string;
  video_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  read_time_minutes: number;
  created_at: Date;
  created_by: string;
};

type RevisionMediaRow = {
  media: BlogRevisionMedia;
};

const mediaJson = (alias: string) => `
  jsonb_build_object(
    'id', ${alias}.id,
    'storageKind', ${alias}.storage_kind,
    'storageKey', ${alias}.storage_key,
    'publicUrl', ${alias}.public_url,
    'originalFilename', ${alias}.original_filename,
    'mimeType', ${alias}.mime_type,
    'width', ${alias}.width,
    'height', ${alias}.height,
    'byteSize', ${alias}.byte_size,
    'checksumSha256', ${alias}.checksum_sha256,
    'createdAt', ${alias}.created_at,
    'createdBy', ${alias}.created_by,
    'trashedAt', ${alias}.trashed_at
  )
`;

const revisionMediaJson = (referenceAlias: string, assetAlias: string) => `
  jsonb_build_object(
    'mediaId', ${referenceAlias}.media_asset_id,
    'role', ${referenceAlias}.role,
    'position', ${referenceAlias}.position,
    'altText', ${referenceAlias}.alt_text,
    'decorative', ${referenceAlias}.decorative,
    'caption', ${referenceAlias}.caption,
    'asset', ${mediaJson(assetAlias)}
  )
`;

const publishedPostSelect = `
  SELECT
    post.id,
    post.slug,
    post.status,
    post.version,
    revision.id AS revision_id,
    revision.title,
    revision.excerpt,
    revision.category,
    revision.content_document,
    revision.tags,
    revision.author_name,
    revision.author_role,
    revision.author_bio,
    revision.video_id,
    revision.seo_title,
    revision.seo_description,
    revision.read_time_minutes,
    post.first_published_at,
    post.content_modified_at,
    revision.created_at AS revision_created_at,
    revision.created_by AS revision_created_by,
    author_asset.media AS author_media,
    author_profile_asset.media AS author_profile_media,
    cover_asset.media AS cover_media,
    hero_asset.media AS hero_media,
    social_asset.media AS social_media
  FROM content.blog_posts AS post
  INNER JOIN content.blog_post_revisions AS revision
    ON revision.id = post.published_revision_id
  LEFT JOIN LATERAL (
    SELECT ${revisionMediaJson("reference", "asset")} AS media
    FROM content.blog_revision_media AS reference
    INNER JOIN content.blog_media_assets AS asset ON asset.id = reference.media_asset_id
    WHERE reference.revision_id = revision.id AND reference.role = 'byline-avatar'
    ORDER BY reference.position ASC
    LIMIT 1
  ) AS author_asset ON true
  LEFT JOIN LATERAL (
    SELECT ${revisionMediaJson("reference", "asset")} AS media
    FROM content.blog_revision_media AS reference
    INNER JOIN content.blog_media_assets AS asset ON asset.id = reference.media_asset_id
    WHERE reference.revision_id = revision.id AND reference.role = 'author-profile'
    ORDER BY reference.position ASC
    LIMIT 1
  ) AS author_profile_asset ON true
  LEFT JOIN LATERAL (
    SELECT ${revisionMediaJson("reference", "asset")} AS media
    FROM content.blog_revision_media AS reference
    INNER JOIN content.blog_media_assets AS asset ON asset.id = reference.media_asset_id
    WHERE reference.revision_id = revision.id AND reference.role = 'cover'
    ORDER BY reference.position ASC
    LIMIT 1
  ) AS cover_asset ON true
  LEFT JOIN LATERAL (
    SELECT ${revisionMediaJson("reference", "asset")} AS media
    FROM content.blog_revision_media AS reference
    INNER JOIN content.blog_media_assets AS asset ON asset.id = reference.media_asset_id
    WHERE reference.revision_id = revision.id AND reference.role = 'hero'
    ORDER BY reference.position ASC
    LIMIT 1
  ) AS hero_asset ON true
  LEFT JOIN LATERAL (
    SELECT ${revisionMediaJson("reference", "asset")} AS media
    FROM content.blog_revision_media AS reference
    INNER JOIN content.blog_media_assets AS asset ON asset.id = reference.media_asset_id
    WHERE reference.revision_id = revision.id AND reference.role = 'social'
    ORDER BY reference.position ASC
    LIMIT 1
  ) AS social_asset ON true
`;

function isoDate(value: Date | null) {
  return value?.toISOString() ?? null;
}

function mapSummary(row: PublishedPostRow): BlogPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    version: row.version,
    revisionId: row.revision_id,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    publishedAt: row.first_published_at.toISOString(),
    modifiedAt: isoDate(row.content_modified_at),
    readTimeMinutes: row.read_time_minutes,
    author: row.author_name,
    authorRole: row.author_role,
    authorImage: row.author_media,
    image: row.cover_media,
    videoId: row.video_id,
  };
}

async function listRevisionMedia(revisionId: string) {
  const result = await getPostgresPool().query<RevisionMediaRow>(
    `
      SELECT ${revisionMediaJson("reference", "asset")} AS media
      FROM content.blog_revision_media AS reference
      INNER JOIN content.blog_media_assets AS asset ON asset.id = reference.media_asset_id
      WHERE reference.revision_id = $1
      ORDER BY reference.role ASC, reference.position ASC
    `,
    [revisionId],
  );

  return result.rows.map((row) => row.media);
}

function mapRevision(row: RevisionRow, media: readonly BlogRevisionMedia[]): BlogPostRevision {
  return {
    id: row.id,
    postId: row.post_id,
    revisionNumber: row.revision_number,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    content: row.content_document,
    tags: row.tags,
    author: row.author_name,
    authorRole: row.author_role,
    authorBio: row.author_bio,
    videoId: row.video_id,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    readTimeMinutes: row.read_time_minutes,
    media,
    createdAt: row.created_at.toISOString(),
    createdBy: row.created_by,
  };
}

async function findPublishedRowById(postId: string) {
  const result = await getPostgresPool().query<PublishedPostRow>(
    `${publishedPostSelect}
      WHERE post.id = $1
        AND post.status = 'published'
        AND post.published_revision_id IS NOT NULL
    `,
    [postId],
  );

  return result.rows[0] ?? null;
}

export async function listPublishedBlogPostRecords(
  page: number,
  pageSize: number,
): Promise<BlogPostPage> {
  const offset = (page - 1) * pageSize;
  const result = await getPostgresPool().query<PublishedPostRow>(
    `${publishedPostSelect.replace("SELECT", "SELECT count(*) OVER()::text AS total_count,")}
      WHERE post.status = 'published'
        AND post.published_revision_id IS NOT NULL
      ORDER BY post.first_published_at DESC, post.id ASC
      LIMIT $1 OFFSET $2
    `,
    [pageSize, offset],
  );
  const total = Number(result.rows[0]?.total_count ?? 0);

  return {
    posts: result.rows.map(mapSummary),
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}

export async function findPublishedBlogPostRecordBySlug(
  requestedSlug: string,
): Promise<BlogSlugResolution | null> {
  const resolution = await getPostgresPool().query<{
    post_id: string;
    canonical_slug: string;
    redirect: boolean;
  }>(
    `
      SELECT post.id AS post_id, post.slug AS canonical_slug, false AS redirect
      FROM content.blog_posts AS post
      WHERE post.slug = $1
      UNION ALL
      SELECT post.id AS post_id, post.slug AS canonical_slug, true AS redirect
      FROM content.blog_post_slugs AS history
      INNER JOIN content.blog_posts AS post ON post.id = history.post_id
      WHERE history.slug = $1 AND history.kind = 'historical'
      LIMIT 1
    `,
    [requestedSlug],
  );
  const resolved = resolution.rows[0];
  if (!resolved) return null;

  const row = await findPublishedRowById(resolved.post_id);
  if (!row) return null;
  const media = await listRevisionMedia(row.revision_id);

  return {
    canonicalSlug: resolved.canonical_slug,
    requestedSlug,
    redirect: resolved.redirect,
    post: {
      ...mapSummary(row),
      authorBio: row.author_bio,
      authorProfileImage: row.author_profile_media,
      heroImage: row.hero_media,
      socialImage: row.social_media ?? row.cover_media,
      tags: row.tags,
      content: row.content_document,
      media,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
    },
  };
}

export async function findPublishedBlogPostReferenceRecordBySlug(
  slug: string,
): Promise<BlogPostReference | null> {
  const result = await getPostgresPool().query<BlogPostReference>(
    `
      SELECT post.id, post.slug, revision.title
      FROM content.blog_posts AS post
      INNER JOIN content.blog_post_revisions AS revision
        ON revision.id = post.published_revision_id
      WHERE post.slug = $1
        AND post.status = 'published'
        AND post.published_revision_id IS NOT NULL
    `,
    [slug],
  );

  return result.rows[0] ?? null;
}

export async function findNextPublishedBlogPostRecord(postId: string) {
  const current = await getPostgresPool().query<{
    first_published_at: Date;
    id: string;
  }>(
    `
      SELECT first_published_at, id
      FROM content.blog_posts
      WHERE id = $1 AND status = 'published'
    `,
    [postId],
  );
  const row = current.rows[0];
  if (!row) return null;

  const next = await getPostgresPool().query<{ id: string }>(
    `
      SELECT id
      FROM content.blog_posts
      WHERE status = 'published'
        AND published_revision_id IS NOT NULL
        AND id <> $1
        AND (first_published_at, id) < ($2::timestamptz, $1::uuid)
      ORDER BY first_published_at DESC, id DESC
      LIMIT 1
    `,
    [postId, row.first_published_at],
  );
  const fallback =
    next.rows[0] ??
    (
      await getPostgresPool().query<{ id: string }>(
        `
          SELECT id
          FROM content.blog_posts
          WHERE status = 'published' AND published_revision_id IS NOT NULL AND id <> $1
          ORDER BY first_published_at DESC, id DESC
          LIMIT 1
        `,
        [postId],
      )
    ).rows[0];
  if (!fallback) return null;

  const published = await findPublishedRowById(fallback.id);
  return published ? mapSummary(published) : null;
}

export async function listPublishedBlogSitemapRecords(): Promise<
  readonly BlogSitemapEntry[]
> {
  const result = await getPostgresPool().query<{
    slug: string;
    first_published_at: Date;
    content_modified_at: Date | null;
  }>(
    `
      SELECT slug, first_published_at, content_modified_at
      FROM content.blog_posts
      WHERE status = 'published' AND published_revision_id IS NOT NULL
      ORDER BY first_published_at DESC, id ASC
    `,
  );

  return result.rows.map((row) => ({
    slug: row.slug,
    publishedAt: row.first_published_at.toISOString(),
    modifiedAt: isoDate(row.content_modified_at),
  }));
}

export async function findBlogPostRevisionRecord(postId: string, revisionId: string) {
  const result = await getPostgresPool().query<RevisionRow>(
    `
      SELECT *
      FROM content.blog_post_revisions
      WHERE post_id = $1 AND id = $2
    `,
    [postId, revisionId],
  );
  const row = result.rows[0];
  if (!row) return null;

  return mapRevision(row, await listRevisionMedia(row.id));
}

export async function findBlogPostAdminRecord(
  postId: string,
): Promise<Omit<BlogPostAdminRecord, "activeSchedule"> | null> {
  const result = await getPostgresPool().query<AdminPostRow>(
    `
      SELECT
        id,
        slug,
        status,
        version,
        current_revision_id,
        published_revision_id,
        first_published_at,
        content_modified_at,
        created_at,
        updated_at,
        archived_at
      FROM content.blog_posts
      WHERE id = $1
    `,
    [postId],
  );
  const row = result.rows[0];
  if (!row) return null;
  const revision = await findBlogPostRevisionRecord(row.id, row.current_revision_id);
  if (!revision) return null;

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    version: row.version,
    currentRevisionId: row.current_revision_id,
    publishedRevisionId: row.published_revision_id,
    firstPublishedAt: isoDate(row.first_published_at),
    contentModifiedAt: isoDate(row.content_modified_at),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt: isoDate(row.archived_at),
    currentRevision: revision,
  };
}
