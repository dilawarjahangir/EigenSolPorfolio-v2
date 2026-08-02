BEGIN;

CREATE OR REPLACE FUNCTION content.admin_audit_metadata_is_safe(value jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  item record;
  text_value text;
BEGIN
  CASE jsonb_typeof(value)
    WHEN 'object' THEN
      FOR item IN SELECT entry.key, entry.value FROM jsonb_each(value) AS entry
      LOOP
        IF item.key ~* '^(body|comment|content|credential|email|password|recovery.?codes?|secret|token)$'
          OR NOT content.admin_audit_metadata_is_safe(item.value)
        THEN
          RETURN false;
        END IF;
      END LOOP;
    WHEN 'array' THEN
      FOR item IN
        SELECT elements.element AS value
        FROM jsonb_array_elements(value) AS elements(element)
      LOOP
        IF NOT content.admin_audit_metadata_is_safe(item.value) THEN
          RETURN false;
        END IF;
      END LOOP;
    WHEN 'string' THEN
      text_value := value #>> '{}';
      IF char_length(text_value) > 500
        OR text_value ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      THEN
        RETURN false;
      END IF;
    ELSE
      NULL;
  END CASE;

  RETURN true;
END;
$$;

CREATE TABLE content.admin_audit_events (
  id uuid PRIMARY KEY,
  actor_id varchar(200),
  action varchar(80) NOT NULL,
  entity_type varchar(80) NOT NULL,
  entity_id varchar(200),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_audit_events_action_check
    CHECK (action ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'),
  CONSTRAINT admin_audit_events_entity_type_check
    CHECK (entity_type ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'),
  CONSTRAINT admin_audit_events_actor_id_check
    CHECK (actor_id IS NULL OR actor_id ~ '^[A-Za-z0-9:_-]{1,200}$'),
  CONSTRAINT admin_audit_events_entity_id_check
    CHECK (entity_id IS NULL OR entity_id ~ '^[A-Za-z0-9:_-]{1,200}$'),
  CONSTRAINT admin_audit_events_metadata_check
    CHECK (
      jsonb_typeof(metadata) = 'object'
      AND content.admin_audit_metadata_is_safe(metadata)
    )
);

CREATE INDEX admin_audit_events_recent_lookup
  ON content.admin_audit_events (created_at DESC, id DESC);

CREATE INDEX admin_audit_events_entity_lookup
  ON content.admin_audit_events (entity_type, entity_id, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION content.reject_admin_audit_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'admin audit events are immutable'
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER admin_audit_events_immutable
  BEFORE UPDATE OR DELETE ON content.admin_audit_events
  FOR EACH ROW EXECUTE FUNCTION content.reject_admin_audit_change();

INSERT INTO content.schema_migrations (version)
VALUES ('005_admin_audit')
ON CONFLICT (version) DO NOTHING;

COMMIT;
