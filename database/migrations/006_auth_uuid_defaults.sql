BEGIN;

ALTER TABLE auth."session"
  DROP CONSTRAINT "session_userId_fkey";

ALTER TABLE auth.account
  DROP CONSTRAINT "account_userId_fkey";

ALTER TABLE auth."twoFactor"
  DROP CONSTRAINT "twoFactor_userId_fkey";

ALTER TABLE auth."user"
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE auth."session"
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid;

ALTER TABLE auth.account
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid;

ALTER TABLE auth.verification
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE auth."twoFactor"
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid;

ALTER TABLE auth."rateLimit"
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE auth."session"
  ADD CONSTRAINT "session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES auth."user"(id) ON DELETE CASCADE;

ALTER TABLE auth.account
  ADD CONSTRAINT "account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES auth."user"(id) ON DELETE CASCADE;

ALTER TABLE auth."twoFactor"
  ADD CONSTRAINT "twoFactor_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES auth."user"(id) ON DELETE CASCADE;

INSERT INTO auth.schema_migrations (version)
VALUES ('006_auth_uuid_defaults')
ON CONFLICT (version) DO NOTHING;

COMMIT;
