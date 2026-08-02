import "server-only";

import type {
  BlogAdminPostPage,
  BlogAdminPostOption,
  BlogAuditAction,
  BlogAuditEventSummary,
  BlogDashboardSummary,
  BlogPostRevisionSummary,
  BlogPostStatus,
  BlogPublicationSchedule,
} from "@/contracts/blog-cms";
import { getPostgresPool } from "@/database/PostgresDatabase";

type AdminListRow = {
  id: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  title: string;
  revision_number: number;
  first_published_at: Date | null;
  updated_at: Date;
  active_schedule: BlogPublicationSchedule | null;
  total_count: string;
};

type RevisionSummaryRow = {
  id: string;
  revision_number: number;
  title: string;
  created_at: Date;
  created_by: string;
  is_current: boolean;
  is_published: boolean;
};

type AuditRow = {
  id: string;
  post_id: string;
  slug: string;
  revision_id: string | null;
  action: BlogAuditAction;
  actor_id: string;
  created_at: Date;
};

export async function listAdminBlogPostRecords(input: Readonly<{
  status?: BlogPostStatus;
  search?: string;
  category?: string;
  page: number;
  pageSize: number;
}>): Promise<BlogAdminPostPage> {
  const result = await getPostgresPool().query<AdminListRow>(
    `
      SELECT
        count(*) OVER()::text AS total_count,
        post.id,
        post.slug,
        post.status,
        post.version,
        revision.title,
        revision.revision_number,
        post.first_published_at,
        post.updated_at,
        schedule.active_schedule
      FROM content.blog_posts AS post
      INNER JOIN content.blog_post_revisions AS revision
        ON revision.id = post.current_revision_id
      LEFT JOIN LATERAL (
        SELECT jsonb_build_object(
          'id', item.id,
          'postId', item.post_id,
          'revisionId', item.revision_id,
          'action', item.action,
          'status', item.status,
          'executeAt', item.execute_at,
          'expectedPostVersion', item.expected_post_version,
          'expectedStatus', item.expected_status,
          'expectedPublishedRevisionId', item.expected_published_revision_id,
          'attemptCount', item.attempt_count,
          'claimToken', item.claim_token,
          'claimedAt', item.claimed_at,
          'completedAt', item.completed_at,
          'lastErrorCode', item.last_error_code,
          'createdAt', item.created_at,
          'createdBy', item.created_by
        ) AS active_schedule
        FROM content.blog_publication_schedules AS item
        WHERE item.post_id = post.id AND item.status IN ('pending', 'processing')
        LIMIT 1
      ) AS schedule ON true
      WHERE ($1::text IS NULL OR post.status = $1)
        AND (
          $2::text IS NULL
          OR post.slug ILIKE '%' || $2 || '%'
          OR revision.title ILIKE '%' || $2 || '%'
        )
        AND ($3::text IS NULL OR revision.category = $3)
      ORDER BY post.updated_at DESC, post.id DESC
      LIMIT $4 OFFSET $5
    `,
    [
      input.status ?? null,
      input.search ?? null,
      input.category ?? null,
      input.pageSize,
      (input.page - 1) * input.pageSize,
    ],
  );
  const total = Number(result.rows[0]?.total_count ?? 0);

  return {
    posts: result.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      status: row.status,
      version: row.version,
      title: row.title,
      currentRevisionNumber: row.revision_number,
      firstPublishedAt: row.first_published_at?.toISOString() ?? null,
      updatedAt: row.updated_at.toISOString(),
      activeSchedule: row.active_schedule,
    })),
    page: input.page,
    pageSize: input.pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / input.pageSize),
  };
}

export async function listBlogCategoryRecords(): Promise<readonly string[]> {
  const result = await getPostgresPool().query<{ category: string }>(
    `
      SELECT DISTINCT revision.category
      FROM content.blog_posts AS post
      INNER JOIN content.blog_post_revisions AS revision
        ON revision.id = post.current_revision_id
      WHERE revision.category <> ''
      ORDER BY revision.category ASC
    `,
  );

  return result.rows.map((row) => row.category);
}

export async function listAdminBlogPostOptionRecords(): Promise<
  readonly BlogAdminPostOption[]
> {
  const result = await getPostgresPool().query<BlogAdminPostOption>(
    `
      SELECT post.id, post.slug, revision.title
      FROM content.blog_posts AS post
      INNER JOIN content.blog_post_revisions AS revision
        ON revision.id = post.current_revision_id
      ORDER BY lower(revision.title) ASC, revision.title ASC, post.id ASC
    `,
  );

  return result.rows;
}

export async function listBlogPostRevisionSummaryRecords(
  postId: string,
  limit: number,
): Promise<readonly BlogPostRevisionSummary[]> {
  const result = await getPostgresPool().query<RevisionSummaryRow>(
    `
      SELECT
        revision.id,
        revision.revision_number,
        revision.title,
        revision.created_at,
        revision.created_by,
        revision.id = post.current_revision_id AS is_current,
        revision.id = post.published_revision_id AS is_published
      FROM content.blog_post_revisions AS revision
      INNER JOIN content.blog_posts AS post ON post.id = revision.post_id
      WHERE revision.post_id = $1
      ORDER BY revision.revision_number DESC
      LIMIT $2
    `,
    [postId, limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    revisionNumber: row.revision_number,
    title: row.title,
    createdAt: row.created_at.toISOString(),
    createdBy: row.created_by,
    isCurrent: row.is_current,
    isPublished: row.is_published,
  }));
}

export async function getBlogDashboardSummaryRecord(): Promise<BlogDashboardSummary> {
  const [countResult, scheduleResult, auditResult] = await Promise.all([
    getPostgresPool().query<{ status: BlogPostStatus; count: string }>(
      `SELECT status, count(*)::text AS count FROM content.blog_posts GROUP BY status`,
    ),
    getPostgresPool().query<{ scheduled_publications: string; overdue_schedules: string }>(
      `
        SELECT
          count(*) FILTER (WHERE action = 'publish')::text AS scheduled_publications,
          count(*) FILTER (WHERE execute_at < now())::text AS overdue_schedules
        FROM content.blog_publication_schedules
        WHERE status = 'pending'
      `,
    ),
    getPostgresPool().query<AuditRow>(
      `
        SELECT
          event.id,
          event.post_id,
          post.slug,
          event.revision_id,
          event.action,
          event.actor_id,
          event.created_at
        FROM content.blog_post_audit_events AS event
        INNER JOIN content.blog_posts AS post ON post.id = event.post_id
        ORDER BY event.created_at DESC, event.id DESC
        LIMIT 20
      `,
    ),
  ]);
  const postCounts: Record<BlogPostStatus, number> = {
    draft: 0,
    published: 0,
    archived: 0,
  };
  for (const row of countResult.rows) postCounts[row.status] = Number(row.count);
  const recentAuditEvents: BlogAuditEventSummary[] = auditResult.rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    slug: row.slug,
    revisionId: row.revision_id,
    action: row.action,
    actorId: row.actor_id,
    createdAt: row.created_at.toISOString(),
  }));

  return {
    postCounts,
    scheduledPublications: Number(scheduleResult.rows[0]?.scheduled_publications ?? 0),
    overdueSchedules: Number(scheduleResult.rows[0]?.overdue_schedules ?? 0),
    recentAuditEvents,
  };
}
