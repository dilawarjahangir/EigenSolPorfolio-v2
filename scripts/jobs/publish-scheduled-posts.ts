import { getPostgresPool } from "../../src/database/PostgresDatabase";
import { processDueBlogPublications } from "../../src/services/blog-posts/BlogPublicationService";
import { loadOperationsEnvironment } from "../operations/shared";

async function main() {
  loadOperationsEnvironment();

  try {
    const result = await processDueBlogPublications();
    console.info(
      `Scheduled publication run: ${result.claimed} claimed, ${result.completed} completed, ${result.rescheduled} rescheduled, ${result.failed} failed.`,
    );

    if (result.failed > 0) process.exitCode = 1;
  } finally {
    await getPostgresPool().end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Scheduled publication failed.");
  process.exitCode = 1;
});
