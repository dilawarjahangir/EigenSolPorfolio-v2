BEGIN;

CREATE SCHEMA IF NOT EXISTS comments;

CREATE TABLE IF NOT EXISTS comments.blog_comments (
  id uuid PRIMARY KEY,
  post_slug varchar(160) NOT NULL,
  post_title varchar(200) NOT NULL,
  author_name varchar(100),
  author_email varchar(254),
  author_website varchar(500),
  body varchar(3000),
  status varchar(16) NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz,
  CONSTRAINT blog_comments_status_check
    CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT blog_comments_name_check
    CHECK (
      (status IN ('pending', 'approved')
        AND author_name IS NOT NULL
        AND char_length(author_name) BETWEEN 2 AND 100)
      OR (status = 'rejected' AND author_name IS NULL)
    ),
  CONSTRAINT blog_comments_body_check
    CHECK (
      (status IN ('pending', 'approved')
        AND body IS NOT NULL
        AND char_length(body) BETWEEN 10 AND 3000)
      OR (status = 'rejected' AND body IS NULL)
    ),
  CONSTRAINT blog_comments_email_lifecycle_check
    CHECK (
      (status = 'pending' AND author_email IS NOT NULL)
      OR (status IN ('approved', 'rejected') AND author_email IS NULL)
    ),
  CONSTRAINT blog_comments_rejected_data_check
    CHECK (
      status <> 'rejected'
      OR (
        author_name IS NULL
        AND author_website IS NULL
        AND body IS NULL
      )
    ),
  CONSTRAINT blog_comments_moderation_lifecycle_check
    CHECK (
      (status = 'pending' AND moderated_at IS NULL)
      OR (status IN ('approved', 'rejected') AND moderated_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS blog_comments_public_lookup
  ON comments.blog_comments (post_slug, created_at, id)
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS blog_comments_pending_lookup
  ON comments.blog_comments (created_at, id)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS comments.blog_comment_moderation_tokens (
  id uuid PRIMARY KEY,
  comment_id uuid NOT NULL UNIQUE
    REFERENCES comments.blog_comments(id) ON DELETE CASCADE,
  token_hash varchar(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  consumed_action varchar(16),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_comment_token_action_check
    CHECK (consumed_action IS NULL OR consumed_action IN ('approved', 'rejected')),
  CONSTRAINT blog_comment_token_hash_check
    CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT blog_comment_token_expiry_check
    CHECK (expires_at > created_at),
  CONSTRAINT blog_comment_token_consumption_check
    CHECK (
      (consumed_at IS NULL AND consumed_action IS NULL)
      OR (consumed_at IS NOT NULL AND consumed_action IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS blog_comment_tokens_expiry
  ON comments.blog_comment_moderation_tokens (expires_at)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS comments.blog_comment_rate_limits (
  bucket_hash varchar(64) PRIMARY KEY,
  attempt_count integer NOT NULL,
  window_started_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CONSTRAINT blog_comment_rate_limit_hash_check
    CHECK (bucket_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT blog_comment_rate_limit_count_check CHECK (attempt_count > 0),
  CONSTRAINT blog_comment_rate_limit_window_check
    CHECK (expires_at > window_started_at)
);

CREATE INDEX IF NOT EXISTS blog_comment_rate_limits_expiry
  ON comments.blog_comment_rate_limits (expires_at);

CREATE TABLE IF NOT EXISTS comments.schema_migrations (
  version varchar(100) PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO comments.schema_migrations (version)
VALUES ('001_blog_comments')
ON CONFLICT (version) DO NOTHING;

COMMIT;
