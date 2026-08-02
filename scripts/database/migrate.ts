import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PoolClient } from "pg";
import { getPostgresPool } from "../../src/database/PostgresDatabase";
import { legacyBlogCmsSeed } from "../../src/data/legacy-blog-cms-seed";
import { seedLegacyBlogPosts } from "../../src/services/blog-posts/LegacyBlogPostSeedService";
import { createOperationsPool, loadOperationsEnvironment } from "../operations/shared";

type Migration = Readonly<{
  version: string;
  ledger: "comments.schema_migrations" | "content.schema_migrations" | "auth.schema_migrations";
  file: string;
}>;

const migrations: readonly Migration[] = [
  {
    version: "001_blog_comments",
    ledger: "comments.schema_migrations",
    file: path.resolve("database/migrations/001_blog_comments.sql"),
  },
  {
    version: "002_blog_cms",
    ledger: "content.schema_migrations",
    file: path.resolve("database/migrations/002_blog_cms.sql"),
  },
  {
    version: "003_comment_admin",
    ledger: "comments.schema_migrations",
    file: path.resolve("database/migrations/003_comment_admin.sql"),
  },
  {
    version: "004_admin_auth",
    ledger: "auth.schema_migrations",
    file: path.resolve("database/migrations/004_admin_auth.sql"),
  },
  {
    version: "005_admin_audit",
    ledger: "content.schema_migrations",
    file: path.resolve("database/migrations/005_admin_audit.sql"),
  },
  {
    version: "006_auth_uuid_defaults",
    ledger: "auth.schema_migrations",
    file: path.resolve("database/migrations/006_auth_uuid_defaults.sql"),
  },
];

async function migrationIsApplied(client: PoolClient, migration: Migration) {
  const ledger = await client.query<{ relation: string | null }>(
    "SELECT to_regclass($1)::text AS relation",
    [migration.ledger],
  );
  if (!ledger.rows[0]?.relation) return false;

  const result = await client.query<{ applied: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM ${migration.ledger} WHERE version = $1) AS applied`,
    [migration.version],
  );
  return result.rows[0]?.applied === true;
}

async function assertMigrationOrder(client: PoolClient) {
  let missingEarlierMigration: string | null = null;
  for (const migration of migrations) {
    const applied = await migrationIsApplied(client, migration);

    if (!applied && missingEarlierMigration === null) {
      missingEarlierMigration = migration.version;
      continue;
    }
    if (applied && missingEarlierMigration) {
      throw new Error(
        `Migration order is inconsistent: ${migration.version} is applied before ${missingEarlierMigration}.`,
      );
    }
  }
}

async function applyMigration(client: PoolClient, migration: Migration) {
  if (await migrationIsApplied(client, migration)) {
    console.info(`Migration ${migration.version}: already applied.`);
    return;
  }

  const sql = await readFile(migration.file, "utf8");
  try {
    await client.query(sql);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  }

  if (!(await migrationIsApplied(client, migration))) {
    throw new Error(`Migration ${migration.version} completed without updating its ledger.`);
  }
  console.info(`Migration ${migration.version}: applied.`);
}

async function main() {
  loadOperationsEnvironment();

  const migrationConnectionString = process.env.MIGRATION_DATABASE_URL?.trim();
  if (migrationConnectionString) process.env.DATABASE_URL = migrationConnectionString;

  const pool = createOperationsPool("eigensol-database-migrations");
  let migrationClient: PoolClient | undefined;
  let applicationPoolWasUsed = false;

  try {
    migrationClient = await pool.connect();
    await migrationClient.query(
      "SELECT pg_advisory_lock(hashtextextended('eigensol-cms-migrations', 0))",
    );
    await assertMigrationOrder(migrationClient);

    await applyMigration(migrationClient, migrations[0]);
    await applyMigration(migrationClient, migrations[1]);

    applicationPoolWasUsed = true;
    const seedResult = await seedLegacyBlogPosts();
    const accountedForPosts = seedResult.insertedPosts + seedResult.existingPosts;
    if (accountedForPosts !== legacyBlogCmsSeed.posts.length) {
      throw new Error(
        `Legacy blog seed accounted for ${accountedForPosts} of ${legacyBlogCmsSeed.posts.length} posts.`,
      );
    }
    console.info(
      `Legacy blog seed: ${seedResult.insertedPosts} inserted, ${seedResult.existingPosts} already present.`,
    );

    for (const migration of migrations.slice(2)) {
      await applyMigration(migrationClient, migration);
    }

    console.info("Database migrations and legacy blog seed are complete.");
  } finally {
    if (migrationClient) {
      await migrationClient
        .query("SELECT pg_advisory_unlock(hashtextextended('eigensol-cms-migrations', 0))")
        .catch(() => undefined);
      migrationClient.release();
    }
    await pool.end();
    if (applicationPoolWasUsed) await getPostgresPool().end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Database migration failed.");
  process.exitCode = 1;
});
