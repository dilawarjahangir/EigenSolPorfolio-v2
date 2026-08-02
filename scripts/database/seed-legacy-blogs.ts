import { getPostgresPool } from "../../src/database/PostgresDatabase";
import { legacyBlogCmsSeed } from "../../src/data/legacy-blog-cms-seed";
import { seedLegacyBlogPosts } from "../../src/services/blog-posts/LegacyBlogPostSeedService";
import { loadOperationsEnvironment } from "../operations/shared";

async function main() {
  loadOperationsEnvironment();

  try {
    const result = await seedLegacyBlogPosts();
    const accountedForPosts = result.insertedPosts + result.existingPosts;
    if (accountedForPosts !== legacyBlogCmsSeed.posts.length) {
      throw new Error(
        `Legacy blog seed accounted for ${accountedForPosts} of ${legacyBlogCmsSeed.posts.length} posts.`,
      );
    }
    console.info(
      `Legacy blog seed complete: ${result.insertedPosts} inserted, ${result.existingPosts} already present.`,
    );
  } finally {
    await getPostgresPool().end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Legacy blog seed failed.");
  process.exitCode = 1;
});
