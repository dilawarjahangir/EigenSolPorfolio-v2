BEGIN;

ALTER TABLE comments.blog_comments
  ADD COLUMN post_id uuid,
  ADD COLUMN expires_at timestamptz,
  ADD COLUMN notification_status varchar(16) NOT NULL DEFAULT 'pending',
  ADD COLUMN notification_attempt_id uuid,
  ADD COLUMN notification_attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN notification_last_attempted_at timestamptz,
  ADD COLUMN notification_sent_at timestamptz,
  ADD COLUMN notification_last_error_code varchar(80);

UPDATE comments.blog_comments AS comment
SET post_id = post.id
FROM content.blog_posts AS post
WHERE comment.post_id IS NULL
  AND comment.post_slug = post.slug;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM comments.blog_comments
    WHERE post_id IS NULL
  ) THEN
    RAISE EXCEPTION
      'Cannot add the comment post foreign key: one or more comment slugs have no CMS post';
  END IF;
END
$$;

UPDATE comments.blog_comments
SET expires_at = created_at + interval '30 days'
WHERE expires_at IS NULL;

ALTER TABLE comments.blog_comments
  ALTER COLUMN post_id SET NOT NULL,
  ALTER COLUMN expires_at SET NOT NULL,
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '30 days');

ALTER TABLE comments.blog_comments
  DROP CONSTRAINT blog_comments_status_check,
  DROP CONSTRAINT blog_comments_name_check,
  DROP CONSTRAINT blog_comments_body_check,
  DROP CONSTRAINT blog_comments_email_lifecycle_check,
  DROP CONSTRAINT blog_comments_rejected_data_check,
  DROP CONSTRAINT blog_comments_moderation_lifecycle_check;

ALTER TABLE comments.blog_comment_moderation_tokens
  DROP CONSTRAINT blog_comment_token_action_check;

UPDATE comments.blog_comments
SET
  status = 'expired',
  author_name = NULL,
  author_email = NULL,
  author_website = NULL,
  body = NULL,
  moderated_at = now()
WHERE status = 'pending'
  AND expires_at <= now();

UPDATE comments.blog_comment_moderation_tokens AS token
SET
  consumed_at = COALESCE(token.consumed_at, now()),
  consumed_action = COALESCE(token.consumed_action, 'expired')
FROM comments.blog_comments AS comment
WHERE token.comment_id = comment.id
  AND comment.status = 'expired';

ALTER TABLE comments.blog_comments
  ADD CONSTRAINT blog_comments_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES content.blog_posts(id) ON DELETE RESTRICT,
  ADD CONSTRAINT blog_comments_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'removed', 'expired')),
  ADD CONSTRAINT blog_comments_content_lifecycle_check
    CHECK (
      (
        status IN ('pending', 'approved')
        AND author_name IS NOT NULL
        AND char_length(author_name) BETWEEN 2 AND 100
        AND body IS NOT NULL
        AND char_length(body) BETWEEN 10 AND 3000
      )
      OR (
        status IN ('rejected', 'removed', 'expired')
        AND author_name IS NULL
        AND author_website IS NULL
        AND body IS NULL
      )
    ),
  ADD CONSTRAINT blog_comments_email_lifecycle_check
    CHECK (
      (status = 'pending' AND author_email IS NOT NULL)
      OR (status <> 'pending' AND author_email IS NULL)
    ),
  ADD CONSTRAINT blog_comments_moderation_lifecycle_check
    CHECK (
      (status = 'pending' AND moderated_at IS NULL)
      OR (status <> 'pending' AND moderated_at IS NOT NULL)
    ),
  ADD CONSTRAINT blog_comments_expiry_check
    CHECK (expires_at > created_at),
  ADD CONSTRAINT blog_comments_notification_status_check
    CHECK (notification_status IN ('pending', 'sent', 'failed')),
  ADD CONSTRAINT blog_comments_notification_attempt_count_check
    CHECK (notification_attempt_count >= 0);

ALTER TABLE comments.blog_comment_moderation_tokens
  ADD CONSTRAINT blog_comment_token_action_check
    CHECK (consumed_action IS NULL OR consumed_action IN ('approved', 'rejected', 'expired'));

CREATE TABLE comments.blog_comment_moderation_events (
  id uuid PRIMARY KEY,
  comment_id uuid NOT NULL
    REFERENCES comments.blog_comments(id) ON DELETE CASCADE,
  action varchar(16) NOT NULL,
  source varchar(16) NOT NULL,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_comment_event_action_check
    CHECK (action IN ('approved', 'rejected', 'removed', 'expired')),
  CONSTRAINT blog_comment_event_source_check
    CHECK (source IN ('email_token', 'admin', 'system'))
);

INSERT INTO comments.blog_comment_moderation_events (
  id,
  comment_id,
  action,
  source,
  created_at
)
SELECT
  md5(comment.id::text || ':' || comment.status || ':003')::uuid,
  comment.id,
  comment.status,
  CASE WHEN comment.status = 'expired' THEN 'system' ELSE 'email_token' END,
  comment.moderated_at
FROM comments.blog_comments AS comment
WHERE comment.status IN ('approved', 'rejected', 'expired');

CREATE INDEX blog_comments_admin_status_lookup
  ON comments.blog_comments (status, created_at DESC, id DESC);

CREATE INDEX blog_comments_admin_post_lookup
  ON comments.blog_comments (post_id, status, created_at DESC, id DESC);

CREATE INDEX blog_comments_public_post_lookup
  ON comments.blog_comments (post_id, created_at ASC, id ASC)
  WHERE status = 'approved';

CREATE INDEX blog_comments_pending_expiry
  ON comments.blog_comments (expires_at, id)
  WHERE status = 'pending';

CREATE INDEX blog_comments_notification_retry
  ON comments.blog_comments (notification_status, notification_last_attempted_at, id)
  WHERE status = 'pending' AND notification_status IN ('pending', 'failed');

CREATE INDEX blog_comment_moderation_events_comment_lookup
  ON comments.blog_comment_moderation_events (comment_id, created_at ASC, id ASC);

INSERT INTO comments.schema_migrations (version)
VALUES ('003_comment_admin')
ON CONFLICT (version) DO NOTHING;

COMMIT;
