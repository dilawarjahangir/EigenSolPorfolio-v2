BEGIN;

ALTER TABLE content.blog_posts
  DROP CONSTRAINT blog_posts_current_revision_fk,
  DROP CONSTRAINT blog_posts_published_revision_fk;

ALTER TABLE content.blog_post_revisions
  DROP CONSTRAINT blog_post_revisions_post_fk;

ALTER TABLE content.blog_post_revisions
  ADD CONSTRAINT blog_post_revisions_post_fk
    FOREIGN KEY (post_id) REFERENCES content.blog_posts(id)
    ON DELETE NO ACTION DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE content.blog_posts
  ADD CONSTRAINT blog_posts_current_revision_fk
    FOREIGN KEY (id, current_revision_id)
    REFERENCES content.blog_post_revisions(post_id, id)
    ON DELETE NO ACTION DEFERRABLE INITIALLY DEFERRED,
  ADD CONSTRAINT blog_posts_published_revision_fk
    FOREIGN KEY (id, published_revision_id)
    REFERENCES content.blog_post_revisions(post_id, id)
    ON DELETE NO ACTION DEFERRABLE INITIALLY DEFERRED;

DROP TRIGGER IF EXISTS blog_post_audit_events_immutable
  ON content.blog_post_audit_events;

CREATE TRIGGER blog_post_audit_events_immutable
  BEFORE UPDATE ON content.blog_post_audit_events
  FOR EACH ROW EXECUTE FUNCTION content.reject_immutable_blog_change();

INSERT INTO content.schema_migrations (version)
VALUES ('007_blog_hard_delete')
ON CONFLICT (version) DO NOTHING;

COMMIT;
