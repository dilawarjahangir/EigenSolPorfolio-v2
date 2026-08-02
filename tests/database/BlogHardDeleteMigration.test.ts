import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationPath = "database/migrations/007_blog_hard_delete.sql";
const migrationRunnerPath = "scripts/database/migrate.ts";

describe("blog hard-delete migration", () => {
  it("moves the post/revision FK cycle from immediate RESTRICT checks to deferred NO ACTION checks", async () => {
    const migration = await readFile(migrationPath, "utf8");

    expect(migration).toContain("DROP CONSTRAINT blog_posts_current_revision_fk");
    expect(migration).toContain("DROP CONSTRAINT blog_posts_published_revision_fk");
    expect(migration).toContain("DROP CONSTRAINT blog_post_revisions_post_fk");
    expect(migration.match(/ON DELETE NO ACTION DEFERRABLE INITIALLY DEFERRED/g)).toHaveLength(3);
  });

  it("allows post-specific audit rows to be removed during a permanent post delete", async () => {
    const [migration, runner] = await Promise.all([
      readFile(migrationPath, "utf8"),
      readFile(migrationRunnerPath, "utf8"),
    ]);

    expect(migration).toContain("DROP TRIGGER IF EXISTS blog_post_audit_events_immutable");
    expect(migration).toContain("BEFORE UPDATE ON content.blog_post_audit_events");
    expect(migration).toContain("VALUES ('007_blog_hard_delete')");
    expect(runner).toContain('version: "007_blog_hard_delete"');
  });
});
