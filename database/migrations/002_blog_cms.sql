BEGIN;

CREATE SCHEMA IF NOT EXISTS content;

CREATE TABLE content.blog_media_assets (
  id uuid PRIMARY KEY,
  storage_kind varchar(24) NOT NULL,
  storage_key varchar(500) NOT NULL,
  public_url varchar(2048) NOT NULL,
  original_filename varchar(255) NOT NULL,
  mime_type varchar(100) NOT NULL,
  width integer,
  height integer,
  byte_size bigint,
  checksum_sha256 varchar(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by varchar(200) NOT NULL,
  trashed_at timestamptz,
  CONSTRAINT blog_media_assets_storage_kind_check
    CHECK (storage_kind IN ('legacy-public', 'managed')),
  CONSTRAINT blog_media_assets_storage_key_check
    CHECK (char_length(storage_key) BETWEEN 1 AND 500),
  CONSTRAINT blog_media_assets_public_url_check
    CHECK (public_url ~ '^/[^/]' OR public_url ~ '^https://'),
  CONSTRAINT blog_media_assets_original_filename_check
    CHECK (char_length(original_filename) BETWEEN 1 AND 255),
  CONSTRAINT blog_media_assets_mime_type_check
    CHECK (mime_type ~ '^image/[a-z0-9.+-]+$'),
  CONSTRAINT blog_media_assets_dimensions_check
    CHECK (
      (width IS NULL AND height IS NULL)
      OR (width > 0 AND height > 0)
    ),
  CONSTRAINT blog_media_assets_byte_size_check
    CHECK (byte_size IS NULL OR byte_size > 0),
  CONSTRAINT blog_media_assets_checksum_check
    CHECK (checksum_sha256 IS NULL OR checksum_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT blog_media_assets_storage_key_unique UNIQUE (storage_key),
  CONSTRAINT blog_media_assets_public_url_unique UNIQUE (public_url)
);

CREATE TABLE content.blog_posts (
  id uuid PRIMARY KEY,
  slug varchar(160) NOT NULL UNIQUE,
  status varchar(16) NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  current_revision_id uuid NOT NULL,
  published_revision_id uuid,
  first_published_at timestamptz,
  last_published_at timestamptz,
  content_modified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  created_by varchar(200) NOT NULL,
  updated_by varchar(200) NOT NULL,
  CONSTRAINT blog_posts_slug_check
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT blog_posts_status_check
    CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT blog_posts_version_check CHECK (version > 0),
  CONSTRAINT blog_posts_publication_check
    CHECK (
      status <> 'published'
      OR (published_revision_id IS NOT NULL AND first_published_at IS NOT NULL)
    ),
  CONSTRAINT blog_posts_archive_check
    CHECK (
      (status = 'archived' AND archived_at IS NOT NULL)
      OR (status <> 'archived' AND archived_at IS NULL)
    ),
  CONSTRAINT blog_posts_timestamp_check CHECK (updated_at >= created_at)
);

CREATE TABLE content.blog_media_audit_events (
  id uuid PRIMARY KEY,
  media_asset_id uuid NOT NULL,
  action varchar(24) NOT NULL,
  actor_id varchar(200) NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_media_audit_action_check
    CHECK (action IN ('registered', 'trashed', 'auto-trashed', 'purged')),
  CONSTRAINT blog_media_audit_details_check CHECK (jsonb_typeof(details) = 'object')
);

CREATE TABLE content.blog_post_revisions (
  id uuid PRIMARY KEY,
  post_id uuid NOT NULL,
  revision_number integer NOT NULL,
  slug varchar(160) NOT NULL,
  title varchar(200) NOT NULL,
  excerpt varchar(500) NOT NULL DEFAULT '',
  category varchar(100) NOT NULL DEFAULT '',
  content_document jsonb NOT NULL,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  author_name varchar(100) NOT NULL DEFAULT '',
  author_role varchar(100) NOT NULL DEFAULT '',
  author_bio varchar(1000) NOT NULL DEFAULT '',
  video_id varchar(32),
  seo_title varchar(200),
  seo_description varchar(320),
  read_time_minutes smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by varchar(200) NOT NULL,
  CONSTRAINT blog_post_revisions_post_fk
    FOREIGN KEY (post_id) REFERENCES content.blog_posts(id)
    ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT blog_post_revisions_number_check CHECK (revision_number > 0),
  CONSTRAINT blog_post_revisions_slug_check
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT blog_post_revisions_title_check
    CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT blog_post_revisions_content_check
    CHECK (
      jsonb_typeof(content_document) = 'object'
      AND content_document ->> 'schemaVersion' = '1'
      AND content_document #>> '{doc,type}' = 'doc'
    ),
  CONSTRAINT blog_post_revisions_tags_check
    CHECK (cardinality(tags) <= 30),
  CONSTRAINT blog_post_revisions_video_check
    CHECK (video_id IS NULL OR video_id ~ '^[A-Za-z0-9_-]{6,32}$'),
  CONSTRAINT blog_post_revisions_read_time_check
    CHECK (read_time_minutes BETWEEN 1 AND 240),
  CONSTRAINT blog_post_revisions_post_number_unique
    UNIQUE (post_id, revision_number),
  CONSTRAINT blog_post_revisions_post_id_unique UNIQUE (post_id, id)
);

ALTER TABLE content.blog_posts
  ADD CONSTRAINT blog_posts_current_revision_fk
    FOREIGN KEY (id, current_revision_id)
    REFERENCES content.blog_post_revisions(post_id, id)
    ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT blog_posts_published_revision_fk
    FOREIGN KEY (id, published_revision_id)
    REFERENCES content.blog_post_revisions(post_id, id)
    ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE content.blog_revision_media (
  revision_id uuid NOT NULL
    REFERENCES content.blog_post_revisions(id) ON DELETE RESTRICT,
  media_asset_id uuid NOT NULL
    REFERENCES content.blog_media_assets(id) ON DELETE RESTRICT,
  role varchar(32) NOT NULL,
  position smallint NOT NULL DEFAULT 0,
  alt_text varchar(300) NOT NULL DEFAULT '',
  decorative boolean NOT NULL DEFAULT false,
  caption varchar(500),
  PRIMARY KEY (revision_id, role, position),
  CONSTRAINT blog_revision_media_role_check
    CHECK (
      role IN (
        'cover',
        'hero',
        'byline-avatar',
        'author-profile',
        'social',
        'body',
        'next'
      )
    ),
  CONSTRAINT blog_revision_media_position_check CHECK (position >= 0)
);

CREATE TABLE content.blog_post_slugs (
  slug varchar(160) PRIMARY KEY,
  post_id uuid NOT NULL
    REFERENCES content.blog_posts(id) ON DELETE RESTRICT,
  revision_id uuid,
  kind varchar(16) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by varchar(200) NOT NULL,
  CONSTRAINT blog_post_slugs_revision_fk
    FOREIGN KEY (revision_id)
    REFERENCES content.blog_post_revisions(id)
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT blog_post_slugs_slug_check
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT blog_post_slugs_kind_check
    CHECK (kind IN ('current', 'reserved', 'historical')),
  CONSTRAINT blog_post_slugs_timestamp_check CHECK (updated_at >= created_at)
);

CREATE TABLE content.blog_post_audit_events (
  id uuid PRIMARY KEY,
  post_id uuid NOT NULL
    REFERENCES content.blog_posts(id) ON DELETE RESTRICT,
  revision_id uuid,
  action varchar(40) NOT NULL,
  actor_id varchar(200) NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_post_audit_revision_fk
    FOREIGN KEY (revision_id)
    REFERENCES content.blog_post_revisions(id)
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT blog_post_audit_action_check
    CHECK (
      action IN (
        'created',
        'revision-created',
        'slug-changed',
        'published',
        'unpublished',
        'archived',
        'restored',
        'publication-scheduled',
        'schedule-cancelled',
        'schedule-completed',
        'schedule-failed',
        'revision-pruned',
        'legacy-seeded'
      )
    ),
  CONSTRAINT blog_post_audit_details_check CHECK (jsonb_typeof(details) = 'object')
);

CREATE TABLE content.blog_publication_schedules (
  id uuid PRIMARY KEY,
  post_id uuid NOT NULL
    REFERENCES content.blog_posts(id) ON DELETE RESTRICT,
  revision_id uuid,
  action varchar(16) NOT NULL,
  status varchar(16) NOT NULL DEFAULT 'pending',
  execute_at timestamptz NOT NULL,
  expected_post_version integer NOT NULL,
  expected_status varchar(16) NOT NULL,
  expected_published_revision_id uuid,
  attempt_count integer NOT NULL DEFAULT 0,
  claim_token uuid,
  claimed_at timestamptz,
  completed_at timestamptz,
  last_error_code varchar(80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by varchar(200) NOT NULL,
  CONSTRAINT blog_publication_schedules_revision_fk
    FOREIGN KEY (revision_id)
    REFERENCES content.blog_post_revisions(id)
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT blog_publication_schedules_expected_revision_fk
    FOREIGN KEY (expected_published_revision_id)
    REFERENCES content.blog_post_revisions(id)
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT blog_publication_schedules_action_check
    CHECK (action IN ('publish', 'unpublish')),
  CONSTRAINT blog_publication_schedules_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'failed')),
  CONSTRAINT blog_publication_schedules_revision_check
    CHECK (
      status NOT IN ('pending', 'processing')
      OR (action = 'publish' AND revision_id IS NOT NULL)
      OR (action = 'unpublish' AND revision_id IS NULL)
    ),
  CONSTRAINT blog_publication_schedules_version_check
    CHECK (expected_post_version > 0),
  CONSTRAINT blog_publication_schedules_expected_status_check
    CHECK (expected_status IN ('draft', 'published')),
  CONSTRAINT blog_publication_schedules_expected_publication_check
    CHECK (
      status NOT IN ('pending', 'processing')
      OR (expected_status = 'published' AND expected_published_revision_id IS NOT NULL)
      OR expected_status = 'draft'
    ),
  CONSTRAINT blog_publication_schedules_attempt_check CHECK (attempt_count >= 0),
  CONSTRAINT blog_publication_schedules_claim_check
    CHECK (
      (status = 'processing' AND claim_token IS NOT NULL AND claimed_at IS NOT NULL)
      OR (status <> 'processing' AND claim_token IS NULL AND claimed_at IS NULL)
    ),
  CONSTRAINT blog_publication_schedules_completion_check
    CHECK (
      (status = 'completed' AND completed_at IS NOT NULL)
      OR (status <> 'completed' AND completed_at IS NULL)
    ),
  CONSTRAINT blog_publication_schedules_timestamp_check CHECK (updated_at >= created_at)
);

CREATE UNIQUE INDEX blog_publication_schedules_active_post
  ON content.blog_publication_schedules (post_id)
  WHERE status IN ('pending', 'processing');

CREATE INDEX blog_posts_public_lookup
  ON content.blog_posts (first_published_at DESC, id)
  WHERE status = 'published' AND published_revision_id IS NOT NULL;

CREATE INDEX blog_post_revisions_post_lookup
  ON content.blog_post_revisions (post_id, revision_number DESC);

CREATE INDEX blog_revision_media_asset_lookup
  ON content.blog_revision_media (media_asset_id);

CREATE UNIQUE INDEX blog_post_slugs_current_post
  ON content.blog_post_slugs (post_id)
  WHERE kind = 'current';

CREATE INDEX blog_post_slugs_post_lookup
  ON content.blog_post_slugs (post_id, kind, updated_at DESC);

CREATE INDEX blog_post_audit_events_post_lookup
  ON content.blog_post_audit_events (post_id, created_at DESC, id);

CREATE INDEX blog_publication_schedules_due_lookup
  ON content.blog_publication_schedules (execute_at, id)
  WHERE status = 'pending';

CREATE INDEX blog_media_assets_maintenance_lookup
  ON content.blog_media_assets (created_at, id)
  WHERE trashed_at IS NULL;

CREATE INDEX blog_media_audit_events_asset_lookup
  ON content.blog_media_audit_events (media_asset_id, created_at DESC, id);

CREATE OR REPLACE FUNCTION content.reject_immutable_blog_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% rows are immutable', TG_TABLE_NAME
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER blog_post_revisions_immutable
  BEFORE UPDATE ON content.blog_post_revisions
  FOR EACH ROW EXECUTE FUNCTION content.reject_immutable_blog_change();

CREATE TRIGGER blog_revision_media_immutable
  BEFORE UPDATE ON content.blog_revision_media
  FOR EACH ROW EXECUTE FUNCTION content.reject_immutable_blog_change();

CREATE TRIGGER blog_post_audit_events_immutable
  BEFORE UPDATE OR DELETE ON content.blog_post_audit_events
  FOR EACH ROW EXECUTE FUNCTION content.reject_immutable_blog_change();

CREATE TRIGGER blog_media_audit_events_immutable
  BEFORE UPDATE OR DELETE ON content.blog_media_audit_events
  FOR EACH ROW EXECUTE FUNCTION content.reject_immutable_blog_change();

CREATE TABLE content.schema_migrations (
  version varchar(100) PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO content.schema_migrations (version)
VALUES ('002_blog_cms')
ON CONFLICT (version) DO NOTHING;

COMMIT;
