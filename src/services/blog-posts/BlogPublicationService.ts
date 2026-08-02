import "server-only";

import type {
  BlogCmsActor,
  BlogPublicationRunResult,
  CancelBlogPublicationInput,
  ScheduleBlogPublicationInput,
} from "@/contracts/blog-cms";
import { findBlogPostRevisionRecord } from "@/repositories/BlogPostReadRepository";
import {
  cancelBlogPublicationScheduleRecord,
  claimDueBlogPublicationRecords,
  createBlogPublicationScheduleRecord,
  executeClaimedBlogPublicationRecord,
  failClaimedBlogPublicationRecord,
  recoverStaleBlogPublicationRecords,
} from "@/repositories/BlogPublicationScheduleRepository";
import {
  BlogCmsConflictError,
  BlogCmsNotFoundError,
  BlogCmsValidationError,
} from "./BlogCmsErrors";
import {
  assertBlogRevisionPublishable,
  normalizeBlogCmsActor,
  validateBlogUuid,
} from "./BlogPostValidationService";

const schedulerActor: BlogCmsActor = { id: "system:blog-scheduler" };
const maximumScheduleAttempts = 3;

function positiveInteger(value: number | undefined, fallback: number, maximum: number) {
  const candidate = value ?? fallback;
  if (!Number.isSafeInteger(candidate) || candidate <= 0 || candidate > maximum) {
    throw new BlogCmsValidationError("Scheduling limit is invalid.");
  }
  return candidate;
}

function expectedVersion(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new BlogCmsValidationError("Expected version is invalid.");
  }
  return value;
}

function scheduleTime(value: string) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) {
    throw new BlogCmsValidationError("Publication schedule time is invalid.");
  }
  if (parsed.getTime() <= Date.now()) {
    throw new BlogCmsValidationError("Publication schedule time must be in the future.");
  }
  return parsed.toISOString();
}

function unwrapScheduleMutation(
  result: Awaited<ReturnType<typeof createBlogPublicationScheduleRecord>>,
) {
  if (result.ok) return result.value;
  switch (result.reason) {
    case "not-found":
      throw new BlogCmsNotFoundError("Blog post was not found.", "post-not-found");
    case "version-conflict":
      throw new BlogCmsConflictError(
        "The blog post changed after it was opened.",
        "version-conflict",
        result.actualVersion,
      );
    case "conflict":
      throw new BlogCmsConflictError(
        "The blog post already has an active publication schedule.",
        "active-schedule",
      );
    case "invalid-state":
      throw new BlogCmsConflictError(
        "The blog post is not in a state that allows this schedule.",
        "invalid-state",
      );
  }
}

export async function scheduleBlogPublication(input: ScheduleBlogPublicationInput) {
  validateBlogUuid(input.postId, "post id");
  expectedVersion(input.expectedVersion);
  const actor = normalizeBlogCmsActor(input.actor);
  const executeAt = scheduleTime(input.executeAt);

  if (input.action === "publish") {
    validateBlogUuid(input.revisionId, "revision id");
    const revision = await findBlogPostRevisionRecord(input.postId, input.revisionId);
    if (!revision) {
      throw new BlogCmsNotFoundError("Blog revision was not found.", "revision-not-found");
    }
    assertBlogRevisionPublishable(revision);
    return unwrapScheduleMutation(
      await createBlogPublicationScheduleRecord({ ...input, executeAt, actor }),
    );
  }

  return unwrapScheduleMutation(
    await createBlogPublicationScheduleRecord({ ...input, executeAt, actor }),
  );
}

export async function cancelBlogPublication(input: CancelBlogPublicationInput) {
  validateBlogUuid(input.scheduleId, "schedule id");
  const result = await cancelBlogPublicationScheduleRecord(
    input.scheduleId,
    normalizeBlogCmsActor(input.actor),
  );
  if (result.ok) return result.value;
  if (result.reason === "not-found") {
    throw new BlogCmsNotFoundError("Publication schedule was not found.", "schedule-not-found");
  }
  throw new BlogCmsConflictError(
    "Only pending publication schedules can be cancelled.",
    "invalid-state",
    result.actualVersion,
  );
}

export async function processDueBlogPublications(
  options: Readonly<{ now?: Date; limit?: number }> = {},
): Promise<BlogPublicationRunResult> {
  const now = options.now ?? new Date();
  if (Number.isNaN(now.getTime())) throw new BlogCmsValidationError("Scheduler time is invalid.");
  const recovered = await recoverStaleBlogPublicationRecords({
    staleBefore: new Date(now.getTime() - 15 * 60_000),
    maximumAttempts: maximumScheduleAttempts,
    actorId: schedulerActor.id,
  });
  const claimed = await claimDueBlogPublicationRecords({
    now,
    limit: positiveInteger(options.limit, 25, 100),
  });
  let completed = 0;
  let failed = recovered.failed;
  let rescheduled = 0;
  const affectedSlugs = new Set<string>();

  for (const item of claimed) {
    try {
      const result = await executeClaimedBlogPublicationRecord({
        scheduleId: item.schedule.id,
        claimToken: item.claimToken,
        publishedAt: now,
        actorId: schedulerActor.id,
      });
      if (result.ok) {
        completed += 1;
        affectedSlugs.add(result.slug);
        continue;
      }
      if (result.reason === "claim-lost") continue;

      const terminal = await failClaimedBlogPublicationRecord({
        scheduleId: item.schedule.id,
        claimToken: item.claimToken,
        errorCode: `execution_${result.reason}`,
        retryAt: now,
        maximumAttempts: 1,
        actorId: schedulerActor.id,
      });
      if (terminal?.status === "failed") failed += 1;
    } catch {
      const retryAt = new Date(
        now.getTime() + Math.min(60, 2 ** item.schedule.attemptCount) * 60_000,
      );
      const retry = await failClaimedBlogPublicationRecord({
        scheduleId: item.schedule.id,
        claimToken: item.claimToken,
        errorCode: "execution_error",
        retryAt,
        maximumAttempts: maximumScheduleAttempts,
        actorId: schedulerActor.id,
      });
      if (retry?.status === "failed") failed += 1;
      if (retry?.status === "pending") rescheduled += 1;
    }
  }

  return {
    claimed: claimed.length,
    completed,
    failed,
    rescheduled,
    affectedSlugs: [...affectedSlugs],
  };
}
