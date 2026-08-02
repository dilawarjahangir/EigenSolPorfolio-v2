import { getPostgresPool } from "../../src/database/PostgresDatabase";
import { runBlogCommentLifecycleMaintenance } from "../../src/services/blog-comments/BlogCommentService";
import { purgeExpiredManagedBlogMedia } from "../../src/services/blog-media/BlogMediaStorageService";
import { runBlogCmsMaintenance } from "../../src/services/blog-posts/BlogCmsMaintenanceService";
import { loadOperationsEnvironment } from "../operations/shared";

async function main() {
  loadOperationsEnvironment();

  try {
    const cms = await runBlogCmsMaintenance();
    const comments = await runBlogCommentLifecycleMaintenance();
    const media = await purgeExpiredManagedBlogMedia();

    console.info(
      [
        `CMS maintenance: ${cms.recoveredSchedules} schedules recovered,`,
        `${cms.failedSchedules} schedules failed,`,
        `${cms.archivedMedia} orphaned media assets trashed,`,
        `${cms.prunedRevisions} revisions pruned.`,
      ].join(" "),
    );
    console.info(
      [
        `Comment maintenance: ${comments.expiredCount} expired,`,
        `${comments.purgedTokenCount} tokens purged,`,
        `${comments.purgedCommentCount} redacted tombstones purged.`,
      ].join(" "),
    );
    console.info(
      [
        `Media purge: ${media.selected} selected,`,
        `${media.purged} purged,`,
        `${media.missingFiles} missing files reconciled,`,
        `${media.skipped} skipped after safety recheck.`,
      ].join(" "),
    );

    if (cms.failedSchedules > 0) process.exitCode = 1;
  } finally {
    await getPostgresPool().end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "CMS maintenance failed.");
  process.exitCode = 1;
});
