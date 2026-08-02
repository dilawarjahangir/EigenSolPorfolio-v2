import "server-only";

import type {
  ArchiveBlogPostInput,
  BlogCmsActor,
  BlogMediaAssetInput,
  BlogMediaAssetPage,
  BlogPostStatus,
  CreateBlogPostDraftInput,
  HardDeleteBlogPostInput,
  PublishBlogPostInput,
  RestoreBlogPostInput,
  UnpublishBlogPostInput,
  UpdateBlogPostDraftInput,
} from "@/contracts/blog-cms";
import { blogPostStatuses } from "@/contracts/blog-cms";
import {
  autoTrashOrphanedBlogMediaRecords,
  finalizeBlogMediaAssetPurgeRecord,
  findActiveBlogMediaAssetByStorageKeyRecord,
  listBlogMediaAssetRecords,
  listPurgeableBlogMediaAssetRecords,
  registerBlogMediaAssetRecord,
  trashBlogMediaAssetRecord,
  type BlogMediaRepositoryCursor,
} from "@/repositories/BlogMediaRepository";
import {
  getBlogDashboardSummaryRecord,
  listAdminBlogPostOptionRecords,
  listAdminBlogPostRecords,
  listBlogCategoryRecords,
  listBlogPostRevisionSummaryRecords,
} from "@/repositories/BlogCmsAdminRepository";
import {
  archiveBlogPostRecord,
  createBlogPostDraftRecord,
  hardDeleteBlogPostRecord,
  type BlogPostHardDeleteRepositoryResult,
  publishBlogPostRevisionRecord,
  restoreBlogPostRecord,
  type BlogPostRepositoryResult,
  unpublishBlogPostRecord,
  updateBlogPostDraftRecord,
} from "@/repositories/BlogPostRepository";
import {
  findBlogPostAdminRecord,
  findBlogPostRevisionRecord,
  findNextPublishedBlogPostRecord,
  findPublishedBlogPostRecordBySlug,
  findPublishedBlogPostReferenceRecordBySlug,
  listPublishedBlogPostRecords,
  listPublishedBlogSitemapRecords,
} from "@/repositories/BlogPostReadRepository";
import { findActiveBlogPublicationScheduleRecord } from "@/repositories/BlogPublicationScheduleRepository";
import {
  BlogCmsConflictError,
  BlogCmsNotFoundError,
  BlogCmsValidationError,
} from "./BlogCmsErrors";
import {
  assertBlogRevisionPublishable,
  normalizeBlogCmsActor,
  normalizeBlogMediaAssetInput,
  normalizeBlogRevision,
  normalizeBlogSlug,
  validateBlogUuid,
} from "./BlogPostValidationService";

export { BlogCmsConflictError, BlogCmsNotFoundError, BlogCmsValidationError };

const publicSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function positiveInteger(value: number | undefined, fallback: number, maximum: number) {
  const candidate = value ?? fallback;
  if (!Number.isSafeInteger(candidate) || candidate <= 0 || candidate > maximum) {
    throw new BlogCmsValidationError("Pagination value is invalid.");
  }
  return candidate;
}

function ensureVersion(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new BlogCmsValidationError("Expected version is invalid.");
  }
  return value;
}

function unwrapPostMutation(result: BlogPostRepositoryResult) {
  if (result.ok) return result.value;

  switch (result.reason) {
    case "not-found":
      throw new BlogCmsNotFoundError("Blog post was not found.", "post-not-found");
    case "revision-not-found":
      throw new BlogCmsNotFoundError("Blog revision was not found.", "revision-not-found");
    case "version-conflict":
      throw new BlogCmsConflictError(
        "The blog post changed after it was opened.",
        "version-conflict",
        result.actualVersion,
      );
    case "slug-conflict":
      throw new BlogCmsConflictError("That blog slug is already reserved.", "slug-conflict");
    case "invalid-state":
      throw new BlogCmsConflictError(
        "The blog post is not in a state that allows this operation.",
        "invalid-state",
      );
  }
}

function unwrapPostHardDelete(result: BlogPostHardDeleteRepositoryResult) {
  if (result.ok) return result.value;

  switch (result.reason) {
    case "not-found":
      throw new BlogCmsNotFoundError("Blog post was not found.", "post-not-found");
    case "revision-not-found":
      throw new BlogCmsNotFoundError("Blog revision was not found.", "revision-not-found");
    case "version-conflict":
      throw new BlogCmsConflictError(
        "The blog post changed after it was opened.",
        "version-conflict",
        result.actualVersion,
      );
    case "slug-conflict":
      throw new BlogCmsConflictError("That blog slug is already reserved.", "slug-conflict");
    case "invalid-state":
      throw new BlogCmsConflictError(
        "Only archived blog posts can be permanently deleted.",
        "invalid-state",
      );
  }
}

function normalizeMutationActor(actor: BlogCmsActor) {
  return normalizeBlogCmsActor(actor);
}

export function listPublishedBlogPosts(
  options: Readonly<{ page?: number; pageSize?: number }> = {},
) {
  const page = positiveInteger(options.page, 1, 100_000);
  const pageSize = positiveInteger(options.pageSize, 12, 100);
  return listPublishedBlogPostRecords(page, pageSize);
}

export function getPublishedBlogPostBySlug(slug: string) {
  if (!publicSlugPattern.test(slug) || slug.length > 160) return Promise.resolve(null);
  return findPublishedBlogPostRecordBySlug(slug);
}

export function getPublishedBlogPostReferenceBySlug(slug: string) {
  if (!publicSlugPattern.test(slug) || slug.length > 160) return Promise.resolve(null);
  return findPublishedBlogPostReferenceRecordBySlug(slug);
}

export function getNextPublishedBlogPost(postId: string) {
  validateBlogUuid(postId, "post id");
  return findNextPublishedBlogPostRecord(postId);
}

export function getPublishedBlogSitemapEntries() {
  return listPublishedBlogSitemapRecords();
}

export async function getBlogPostForEditing(postId: string) {
  validateBlogUuid(postId, "post id");
  const [post, activeSchedule] = await Promise.all([
    findBlogPostAdminRecord(postId),
    findActiveBlogPublicationScheduleRecord(postId),
  ]);
  if (!post) throw new BlogCmsNotFoundError("Blog post was not found.", "post-not-found");
  return { ...post, activeSchedule };
}

export async function getBlogPostRevision(postId: string, revisionId: string) {
  validateBlogUuid(postId, "post id");
  validateBlogUuid(revisionId, "revision id");
  const revision = await findBlogPostRevisionRecord(postId, revisionId);
  if (!revision) {
    throw new BlogCmsNotFoundError("Blog revision was not found.", "revision-not-found");
  }
  return revision;
}

export function listAdminBlogPosts(
  options: Readonly<{
    status?: BlogPostStatus;
    search?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }> = {},
) {
  if (options.status && !blogPostStatuses.includes(options.status)) {
    throw new BlogCmsValidationError("Blog status is invalid.");
  }
  const search = options.search?.trim();
  if (search && search.length > 200) throw new BlogCmsValidationError("Search is too long.");
  const category = options.category?.trim();
  if (category && category.length > 100) {
    throw new BlogCmsValidationError("Category is too long.");
  }

  return listAdminBlogPostRecords({
    status: options.status,
    search: search || undefined,
    category: category || undefined,
    page: positiveInteger(options.page, 1, 100_000),
    pageSize: positiveInteger(options.pageSize, 20, 100),
  });
}

export function listBlogPostRevisions(
  postId: string,
  options: Readonly<{ limit?: number }> = {},
) {
  validateBlogUuid(postId, "post id");
  return listBlogPostRevisionSummaryRecords(
    postId,
    positiveInteger(options.limit, 50, 200),
  );
}

export function getBlogDashboardSummary() {
  return getBlogDashboardSummaryRecord();
}

export function listBlogCategories() {
  return listBlogCategoryRecords();
}

export function listAdminBlogPostOptions() {
  return listAdminBlogPostOptionRecords();
}

export function getActiveBlogPublicationSchedule(postId: string) {
  validateBlogUuid(postId, "post id");
  return findActiveBlogPublicationScheduleRecord(postId);
}

export async function createBlogPostDraft(input: CreateBlogPostDraftInput) {
  return unwrapPostMutation(
    await createBlogPostDraftRecord({
      slug: normalizeBlogSlug(input.slug),
      revision: normalizeBlogRevision(input.revision),
      actor: normalizeMutationActor(input.actor),
    }),
  );
}

export async function updateBlogPostDraft(input: UpdateBlogPostDraftInput) {
  validateBlogUuid(input.postId, "post id");
  ensureVersion(input.expectedVersion);
  return unwrapPostMutation(
    await updateBlogPostDraftRecord({
      ...input,
      slug: input.slug ? normalizeBlogSlug(input.slug) : undefined,
      revision: normalizeBlogRevision(input.revision),
      actor: normalizeMutationActor(input.actor),
    }),
  );
}

export async function publishBlogPost(input: PublishBlogPostInput) {
  validateBlogUuid(input.postId, "post id");
  ensureVersion(input.expectedVersion);
  const actor = normalizeMutationActor(input.actor);
  const post = await findBlogPostAdminRecord(input.postId);
  if (!post) throw new BlogCmsNotFoundError("Blog post was not found.", "post-not-found");
  const revisionId = input.revisionId ?? post.currentRevisionId;
  validateBlogUuid(revisionId, "revision id");
  const revision = await findBlogPostRevisionRecord(input.postId, revisionId);
  if (!revision) {
    throw new BlogCmsNotFoundError("Blog revision was not found.", "revision-not-found");
  }
  assertBlogRevisionPublishable(revision);

  return unwrapPostMutation(
    await publishBlogPostRevisionRecord({
      postId: input.postId,
      expectedVersion: input.expectedVersion,
      revisionId,
      publishedAt: new Date(),
      actor,
    }),
  );
}

export async function unpublishBlogPost(input: UnpublishBlogPostInput) {
  validateBlogUuid(input.postId, "post id");
  ensureVersion(input.expectedVersion);
  return unwrapPostMutation(
    await unpublishBlogPostRecord({ ...input, actor: normalizeMutationActor(input.actor) }),
  );
}

export async function archiveBlogPost(input: ArchiveBlogPostInput) {
  validateBlogUuid(input.postId, "post id");
  ensureVersion(input.expectedVersion);
  return unwrapPostMutation(
    await archiveBlogPostRecord({ ...input, actor: normalizeMutationActor(input.actor) }),
  );
}

export async function restoreBlogPost(input: RestoreBlogPostInput) {
  validateBlogUuid(input.postId, "post id");
  ensureVersion(input.expectedVersion);
  return unwrapPostMutation(
    await restoreBlogPostRecord({ ...input, actor: normalizeMutationActor(input.actor) }),
  );
}

export async function hardDeleteBlogPost(input: HardDeleteBlogPostInput) {
  validateBlogUuid(input.postId, "post id");
  ensureVersion(input.expectedVersion);
  return unwrapPostHardDelete(
    await hardDeleteBlogPostRecord({ ...input, actor: normalizeMutationActor(input.actor) }),
  );
}

function decodeMediaCursor(value: string | undefined): BlogMediaRepositoryCursor | undefined {
  if (!value) return undefined;
  if (value.length > 500) throw new BlogCmsValidationError("Media cursor is invalid.");

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      createdAt?: unknown;
      id?: unknown;
    };
    if (typeof parsed.createdAt !== "string" || typeof parsed.id !== "string") throw new Error();
    const createdAt = new Date(parsed.createdAt);
    validateBlogUuid(parsed.id, "media cursor id");
    if (Number.isNaN(createdAt.getTime())) throw new Error();
    return { createdAt, id: parsed.id };
  } catch (error) {
    if (error instanceof BlogCmsValidationError) throw error;
    throw new BlogCmsValidationError("Media cursor is invalid.");
  }
}

function encodeMediaCursor(asset: Readonly<{ createdAt: string; id: string }>) {
  return Buffer.from(JSON.stringify(asset), "utf8").toString("base64url");
}

export async function listBlogMediaAssets(
  options: Readonly<{
    includeTrashed?: boolean;
    limit?: number;
    cursor?: string;
  }> = {},
): Promise<BlogMediaAssetPage> {
  const limit = positiveInteger(options.limit, 40, 100);
  const rows = await listBlogMediaAssetRecords({
    includeTrashed: options.includeTrashed === true,
    limit: limit + 1,
    cursor: decodeMediaCursor(options.cursor),
  });
  const hasMore = rows.length > limit;
  const assets = hasMore ? rows.slice(0, limit) : rows;
  const last = assets.at(-1);

  return {
    assets,
    nextCursor: hasMore && last ? encodeMediaCursor(last) : null,
  };
}

export function getBlogMediaAssetByStorageKey(storageKey: string) {
  const normalized = storageKey.trim();
  if (!normalized || normalized.length > 500 || normalized.includes("..")) {
    throw new BlogCmsValidationError("Media storage key is invalid.");
  }
  return findActiveBlogMediaAssetByStorageKeyRecord(normalized);
}

export async function registerBlogMediaAsset(
  input: BlogMediaAssetInput,
  actor: BlogCmsActor,
) {
  const result = await registerBlogMediaAssetRecord(
    normalizeBlogMediaAssetInput(input),
    normalizeMutationActor(actor),
  );
  if (!result.ok) {
    throw new BlogCmsConflictError("Media storage key is already registered.", "media-conflict");
  }
  return result.value;
}

export async function trashBlogMediaAsset(mediaId: string, actor: BlogCmsActor) {
  validateBlogUuid(mediaId, "media id");
  const result = await trashBlogMediaAssetRecord(mediaId, normalizeMutationActor(actor));
  if (result.ok) return result.value;
  if (result.reason === "not-found") {
    throw new BlogCmsNotFoundError("Media asset was not found.", "media-not-found");
  }
  if (result.reason === "referenced") {
    throw new BlogCmsConflictError(
      "Media used by a blog revision cannot be trashed.",
      "media-referenced",
    );
  }
  throw new BlogCmsConflictError("Media asset could not be trashed.", "media-conflict");
}

export async function autoTrashOrphanedBlogMedia(input: Readonly<{
  olderThan: Date;
  limit?: number;
  actor: BlogCmsActor;
}>) {
  if (Number.isNaN(input.olderThan.getTime())) {
    throw new BlogCmsValidationError("Media maintenance date is invalid.");
  }
  return autoTrashOrphanedBlogMediaRecords({
    olderThan: input.olderThan,
    limit: positiveInteger(input.limit, 100, 500),
    actorId: normalizeMutationActor(input.actor).id,
  });
}

export function listPurgeableBlogMediaAssets(input: Readonly<{
  trashedBefore: Date;
  limit?: number;
}>) {
  if (Number.isNaN(input.trashedBefore.getTime())) {
    throw new BlogCmsValidationError("Media purge date is invalid.");
  }
  return listPurgeableBlogMediaAssetRecords({
    trashedBefore: input.trashedBefore,
    limit: positiveInteger(input.limit, 100, 500),
  });
}

export function finalizeBlogMediaAssetPurge(input: Readonly<{
  mediaId: string;
  storageKey: string;
  trashedBefore: Date;
}>) {
  validateBlogUuid(input.mediaId, "media id");
  if (!/^[a-f0-9]{64}\.webp$/.test(input.storageKey)) {
    throw new BlogCmsValidationError("Managed media storage key is invalid.");
  }
  if (Number.isNaN(input.trashedBefore.getTime())) {
    throw new BlogCmsValidationError("Media purge date is invalid.");
  }
  return finalizeBlogMediaAssetPurgeRecord(input);
}
