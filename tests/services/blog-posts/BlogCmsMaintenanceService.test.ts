// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/repositories/BlogMediaRepository", () => ({
  autoTrashOrphanedBlogMediaRecords: vi.fn(),
}));
vi.mock("@/repositories/BlogCmsMaintenanceRepository", () => ({
  pruneBlogPostRevisionRecords: vi.fn(),
}));
vi.mock("@/repositories/BlogPublicationScheduleRepository", () => ({
  recoverStaleBlogPublicationRecords: vi.fn(),
}));

import { autoTrashOrphanedBlogMediaRecords } from "@/repositories/BlogMediaRepository";
import { pruneBlogPostRevisionRecords } from "@/repositories/BlogCmsMaintenanceRepository";
import { recoverStaleBlogPublicationRecords } from "@/repositories/BlogPublicationScheduleRepository";
import { runBlogCmsMaintenance } from "@/services/blog-posts/BlogCmsMaintenanceService";

describe("blog CMS maintenance", () => {
  beforeEach(() => {
    vi.mocked(recoverStaleBlogPublicationRecords).mockResolvedValue({
      recovered: 2,
      failed: 1,
    });
    vi.mocked(autoTrashOrphanedBlogMediaRecords).mockResolvedValue([]);
    vi.mocked(pruneBlogPostRevisionRecords).mockResolvedValue(7);
  });

  it("reports revision pruning and always retains fifty non-active revisions", async () => {
    const now = new Date("2026-08-02T12:00:00.000Z");
    vi.mocked(autoTrashOrphanedBlogMediaRecords).mockResolvedValue([
      { id: "asset-1" },
      { id: "asset-2" },
    ] as never);

    await expect(runBlogCmsMaintenance({ now })).resolves.toEqual({
      recoveredSchedules: 2,
      failedSchedules: 1,
      archivedMedia: 2,
      prunedRevisions: 7,
    });
    expect(pruneBlogPostRevisionRecords).toHaveBeenCalledWith({
      retainOtherRevisions: 50,
      limit: 500,
      actorId: "system:blog-maintenance",
    });
  });
});
