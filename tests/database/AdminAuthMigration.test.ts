import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const authMigrationPath = "database/migrations/004_admin_auth.sql";
const uuidUpgradePath = "database/migrations/006_auth_uuid_defaults.sql";
const migrationRunnerPath = "scripts/database/migrate.ts";

describe("Better Auth PostgreSQL migrations", () => {
  it("gives every Better Auth primary key a PostgreSQL UUID default", async () => {
    const migration = await readFile(authMigrationPath, "utf8");

    expect(
      migration.match(/id UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/g),
    ).toHaveLength(6);
    expect(migration.match(/"userId" UUID NOT NULL/g)).toHaveLength(3);
  });

  it("upgrades the deployed text IDs before owner bootstrap", async () => {
    const [upgrade, runner] = await Promise.all([
      readFile(uuidUpgradePath, "utf8"),
      readFile(migrationRunnerPath, "utf8"),
    ]);

    expect(upgrade.match(/ALTER COLUMN id SET DEFAULT gen_random_uuid\(\)/g)).toHaveLength(6);
    expect(upgrade).toContain('DROP CONSTRAINT "session_userId_fkey"');
    expect(upgrade).toContain('DROP CONSTRAINT "account_userId_fkey"');
    expect(upgrade).toContain('DROP CONSTRAINT "twoFactor_userId_fkey"');
    expect(upgrade).toContain("VALUES ('006_auth_uuid_defaults')");
    expect(runner).toContain('version: "006_auth_uuid_defaults"');
  });
});
