import "server-only";

import type { BlogCmsMaintenanceResult } from "@/contracts/blog-cms";
import { autoTrashOrphanedBlogMediaRecords } from "@/repositories/BlogMediaRepository";
import { pruneBlogPostRevisionRecords } from "@/repositories/BlogCmsMaintenanceRepository";
import { recoverStaleBlogPublicationRecords } from "@/repositories/BlogPublicationScheduleRepository";
import { BlogCmsValidationError } from "./BlogCmsErrors";

const maintenanceActorId = "system:blog-maintenance";

function boundedInteger(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const candidate = value ?? fallback;
  if (!Number.isSafeInteger(candidate) || candidate < minimum || candidate > maximum) {
    throw new BlogCmsValidationError("Maintenance option is invalid.");
  }
  return candidate;
}

export async function runBlogCmsMaintenance(
  options: Readonly<{
    now?: Date;
    staleScheduleMinutes?: number;
    orphanMediaDays?: number;
    mediaLimit?: number;
    revisionLimit?: number;
  }> = {},
): Promise<BlogCmsMaintenanceResult> {
  const now = options.now ?? new Date();
  if (Number.isNaN(now.getTime())) {
    throw new BlogCmsValidationError("Maintenance time is invalid.");
  }
  const staleScheduleMinutes = boundedInteger(options.staleScheduleMinutes, 15, 5, 1_440);
  const orphanMediaDays = boundedInteger(options.orphanMediaDays, 1, 1, 365);
  const mediaLimit = boundedInteger(options.mediaLimit, 100, 1, 500);
  const revisionLimit = boundedInteger(options.revisionLimit, 500, 1, 2_000);

  const scheduleRecovery = await recoverStaleBlogPublicationRecords({
    staleBefore: new Date(now.getTime() - staleScheduleMinutes * 60_000),
    maximumAttempts: 3,
    actorId: maintenanceActorId,
  });
  const archivedMedia = await autoTrashOrphanedBlogMediaRecords({
    olderThan: new Date(now.getTime() - orphanMediaDays * 86_400_000),
    limit: mediaLimit,
    actorId: maintenanceActorId,
  });
  const prunedRevisions = await pruneBlogPostRevisionRecords({
    retainOtherRevisions: 50,
    limit: revisionLimit,
    actorId: maintenanceActorId,
  });

  return {
    recoveredSchedules: scheduleRecovery.recovered,
    failedSchedules: scheduleRecovery.failed,
    archivedMedia: archivedMedia.length,
    prunedRevisions,
  };
}
