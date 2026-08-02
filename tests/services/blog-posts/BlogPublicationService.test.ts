// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlogPublicationSchedule } from "@/contracts/blog-cms";

vi.mock("server-only", () => ({}));
vi.mock("@/repositories/BlogPostReadRepository", () => ({
  findBlogPostRevisionRecord: vi.fn(),
}));
vi.mock("@/repositories/BlogPublicationScheduleRepository", () => ({
  cancelBlogPublicationScheduleRecord: vi.fn(),
  claimDueBlogPublicationRecords: vi.fn(),
  createBlogPublicationScheduleRecord: vi.fn(),
  executeClaimedBlogPublicationRecord: vi.fn(),
  failClaimedBlogPublicationRecord: vi.fn(),
  recoverStaleBlogPublicationRecords: vi.fn(),
}));

import {
  claimDueBlogPublicationRecords,
  executeClaimedBlogPublicationRecord,
  failClaimedBlogPublicationRecord,
  recoverStaleBlogPublicationRecords,
} from "@/repositories/BlogPublicationScheduleRepository";
import {
  processDueBlogPublications,
  scheduleBlogPublication,
} from "@/services/blog-posts/BlogPublicationService";

const schedule: BlogPublicationSchedule = {
  id: "00000000-0000-4000-8000-000000000010",
  postId: "00000000-0000-4000-8000-000000000011",
  revisionId: "00000000-0000-4000-8000-000000000012",
  action: "publish",
  status: "processing",
  executeAt: "2026-08-02T11:00:00.000Z",
  expectedPostVersion: 3,
  expectedStatus: "published",
  expectedPublishedRevisionId: "00000000-0000-4000-8000-000000000013",
  attemptCount: 1,
  claimToken: "00000000-0000-4000-8000-000000000014",
  claimedAt: "2026-08-02T12:00:00.000Z",
  completedAt: null,
  lastErrorCode: null,
  createdAt: "2026-08-01T12:00:00.000Z",
  createdBy: "owner",
};

describe("scheduled blog publication processing", () => {
  beforeEach(() => {
    vi.mocked(recoverStaleBlogPublicationRecords).mockResolvedValue({
      recovered: 0,
      failed: 0,
    });
    vi.mocked(claimDueBlogPublicationRecords).mockResolvedValue([
      { schedule, claimToken: schedule.claimToken! },
    ]);
  });

  it("publishes a frozen revision using the execution timestamp", async () => {
    const now = new Date("2026-08-02T12:00:00.000Z");
    vi.mocked(executeClaimedBlogPublicationRecord).mockResolvedValue({
      ok: true,
      slug: "scheduled-post",
    });

    await expect(processDueBlogPublications({ now })).resolves.toEqual({
      claimed: 1,
      completed: 1,
      failed: 0,
      rescheduled: 0,
      affectedSlugs: ["scheduled-post"],
    });
    expect(executeClaimedBlogPublicationRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        scheduleId: schedule.id,
        publishedAt: now,
      }),
    );
    expect(recoverStaleBlogPublicationRecords).toHaveBeenCalledWith({
      staleBefore: new Date("2026-08-02T11:45:00.000Z"),
      maximumAttempts: 3,
      actorId: "system:blog-scheduler",
    });
  });

  it("marks publication-state changes as terminal instead of retrying", async () => {
    const now = new Date("2026-08-02T12:00:00.000Z");
    vi.mocked(executeClaimedBlogPublicationRecord).mockResolvedValue({
      ok: false,
      reason: "invalid-state",
    });
    vi.mocked(failClaimedBlogPublicationRecord).mockResolvedValue({
      ...schedule,
      status: "failed",
      claimToken: null,
      claimedAt: null,
      lastErrorCode: "execution_invalid-state",
    });

    await expect(processDueBlogPublications({ now })).resolves.toMatchObject({
      claimed: 1,
      failed: 1,
      rescheduled: 0,
    });
    expect(failClaimedBlogPublicationRecord).toHaveBeenCalledWith(
      expect.objectContaining({ maximumAttempts: 1 }),
    );
  });

  it("rejects publication times that are not in the future at the service boundary", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-02T12:00:00.000Z"));

    await expect(
      scheduleBlogPublication({
        postId: schedule.postId,
        expectedVersion: 3,
        executeAt: "2026-08-02T12:00:00.000Z",
        action: "unpublish",
        actor: { id: "owner" },
      }),
    ).rejects.toThrow("Publication schedule time must be in the future.");

    vi.useRealTimers();
  });
});
