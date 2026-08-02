export const blogPostStatuses = ["draft", "published", "archived"] as const;
export type BlogPostStatus = (typeof blogPostStatuses)[number];

export const blogMediaStorageKinds = ["legacy-public", "managed"] as const;
export type BlogMediaStorageKind = (typeof blogMediaStorageKinds)[number];

export const blogMediaRoles = [
  "cover",
  "hero",
  "byline-avatar",
  "author-profile",
  "social",
  "body",
  "next",
] as const;
export type BlogMediaRole = (typeof blogMediaRoles)[number];

export const blogPublicationActions = ["publish", "unpublish"] as const;
export type BlogPublicationAction = (typeof blogPublicationActions)[number];

export const blogPublicationScheduleStatuses = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "failed",
] as const;
export type BlogPublicationScheduleStatus =
  (typeof blogPublicationScheduleStatuses)[number];

export const blogAuditActions = [
  "created",
  "revision-created",
  "slug-changed",
  "published",
  "unpublished",
  "archived",
  "restored",
  "publication-scheduled",
  "schedule-cancelled",
  "schedule-completed",
  "schedule-failed",
  "revision-pruned",
  "legacy-seeded",
] as const;
export type BlogAuditAction = (typeof blogAuditActions)[number];

export type BlogCmsActor = Readonly<{
  id: string;
}>;

export type BlogJsonPrimitive = string | number | boolean | null;
export type BlogJsonValue =
  | BlogJsonPrimitive
  | BlogJsonObject
  | readonly BlogJsonValue[];
export type BlogJsonObject = Readonly<{
  [key: string]: BlogJsonValue | undefined;
}>;

export type BlogEditorMark = Readonly<{
  type: string;
  attrs?: BlogJsonObject;
}>;

export type BlogEditorNode = Readonly<{
  type: string;
  attrs?: BlogJsonObject;
  content?: readonly BlogEditorNode[];
  marks?: readonly BlogEditorMark[];
  text?: string;
}>;

export type BlogManagedGalleryItem = Readonly<{
  assetId: string;
  src: string;
  alt: string;
  decorative: boolean;
  caption: string | null;
  width: number;
  height: number;
}>;

export type BlogEditorDocument = Readonly<{
  schemaVersion: 1;
  doc: BlogEditorNode & Readonly<{ type: "doc" }>;
}>;

export type BlogContentBlock = BlogEditorNode;

export type BlogMediaAssetInput = Readonly<{
  id?: string;
  storageKind: BlogMediaStorageKind;
  storageKey: string;
  publicUrl: string;
  originalFilename: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  byteSize?: number | null;
  checksumSha256?: string | null;
}>;

export type BlogMediaAsset = Readonly<{
  id: string;
  storageKind: BlogMediaStorageKind;
  storageKey: string;
  publicUrl: string;
  originalFilename: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  byteSize: number | null;
  checksumSha256: string | null;
  createdAt: string;
  createdBy: string;
  trashedAt: string | null;
}>;

export type BlogMediaAssetPage = Readonly<{
  assets: readonly BlogMediaAsset[];
  nextCursor: string | null;
}>;

export type BlogRevisionMediaInput = Readonly<{
  mediaId: string;
  role: BlogMediaRole;
  position: number;
  altText: string;
  decorative: boolean;
  caption?: string | null;
}>;

export type BlogMediaPurgeCandidate = Readonly<{
  id: string;
  storageKey: string;
  trashedAt: string;
}>;

export type BlogRevisionMedia = BlogRevisionMediaInput &
  Readonly<{
    asset: BlogMediaAsset;
  }>;

export type BlogPostRevisionInput = Readonly<{
  title: string;
  excerpt: string;
  category: string;
  content: BlogEditorDocument;
  tags: readonly string[];
  author: string;
  authorRole: string;
  authorBio: string;
  videoId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  readTimeMinutes?: number;
  media: readonly BlogRevisionMediaInput[];
}>;

export type AdminPostInput = Readonly<{
  postId: string | null;
  expectedVersion: number;
  slug: string;
  revision: BlogPostRevisionInput;
}>;

export type BlogPostRevision = Omit<BlogPostRevisionInput, "media" | "readTimeMinutes"> &
  Readonly<{
    id: string;
    postId: string;
    slug: string;
    revisionNumber: number;
    readTimeMinutes: number;
    media: readonly BlogRevisionMedia[];
    createdAt: string;
    createdBy: string;
  }>;

export type BlogPostSummary = Readonly<{
  id: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  revisionId: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  modifiedAt: string | null;
  readTimeMinutes: number;
  author: string;
  authorRole: string;
  authorImage: BlogRevisionMedia | null;
  image: BlogRevisionMedia | null;
  videoId: string | null;
}>;

export type BlogPostReference = Readonly<{
  id: string;
  slug: string;
  title: string;
}>;

export type BlogPostDetail = BlogPostSummary &
  Readonly<{
    authorBio: string;
    authorProfileImage: BlogRevisionMedia | null;
    heroImage: BlogRevisionMedia | null;
    socialImage: BlogRevisionMedia | null;
    tags: readonly string[];
    content: BlogEditorDocument;
    media: readonly BlogRevisionMedia[];
    seoTitle: string | null;
    seoDescription: string | null;
  }>;

export type BlogPostAdminRecord = Readonly<{
  id: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  currentRevisionId: string;
  publishedRevisionId: string | null;
  firstPublishedAt: string | null;
  contentModifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  currentRevision: BlogPostRevision;
  activeSchedule: BlogPublicationSchedule | null;
}>;

export type BlogAdminPostListItem = Readonly<{
  id: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  title: string;
  currentRevisionNumber: number;
  firstPublishedAt: string | null;
  updatedAt: string;
  activeSchedule: BlogPublicationSchedule | null;
}>;

export type BlogAdminPostPage = Readonly<{
  posts: readonly BlogAdminPostListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}>;

export type BlogAdminPostOption = Readonly<{
  id: string;
  slug: string;
  title: string;
}>;

export type BlogPostRevisionSummary = Readonly<{
  id: string;
  revisionNumber: number;
  title: string;
  createdAt: string;
  createdBy: string;
  isCurrent: boolean;
  isPublished: boolean;
}>;

export type BlogAuditEventSummary = Readonly<{
  id: string;
  postId: string;
  slug: string;
  revisionId: string | null;
  action: BlogAuditAction;
  actorId: string;
  createdAt: string;
}>;

export type BlogDashboardSummary = Readonly<{
  postCounts: Readonly<Record<BlogPostStatus, number>>;
  scheduledPublications: number;
  overdueSchedules: number;
  recentAuditEvents: readonly BlogAuditEventSummary[];
}>;

export type BlogPostPage = Readonly<{
  posts: readonly BlogPostSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}>;

export type BlogSitemapEntry = Readonly<{
  slug: string;
  publishedAt: string;
  modifiedAt: string | null;
}>;

export type BlogSlugResolution = Readonly<{
  canonicalSlug: string;
  requestedSlug: string;
  redirect: boolean;
  post: BlogPostDetail;
}>;

export type CreateBlogPostDraftInput = Readonly<{
  slug: string;
  revision: BlogPostRevisionInput;
  actor: BlogCmsActor;
}>;

export type UpdateBlogPostDraftInput = Readonly<{
  postId: string;
  expectedVersion: number;
  slug?: string;
  revision: BlogPostRevisionInput;
  actor: BlogCmsActor;
}>;

export type PublishBlogPostInput = Readonly<{
  postId: string;
  expectedVersion: number;
  revisionId?: string;
  actor: BlogCmsActor;
}>;

export type UnpublishBlogPostInput = Readonly<{
  postId: string;
  expectedVersion: number;
  actor: BlogCmsActor;
}>;

export type ArchiveBlogPostInput = UnpublishBlogPostInput;
export type RestoreBlogPostInput = UnpublishBlogPostInput;
export type HardDeleteBlogPostInput = UnpublishBlogPostInput;

export type BlogPostMutationResult = Readonly<{
  postId: string;
  slug: string;
  status: BlogPostStatus;
  version: number;
  currentRevisionId: string;
  publishedRevisionId: string | null;
}>;

export type BlogPostHardDeleteResult = Readonly<{
  postId: string;
  slug: string;
  revisionCount: number;
  commentCount: number;
}>;

export type BlogPublicationSchedule = Readonly<{
  id: string;
  postId: string;
  revisionId: string | null;
  action: BlogPublicationAction;
  status: BlogPublicationScheduleStatus;
  executeAt: string;
  expectedPostVersion: number;
  expectedStatus: Exclude<BlogPostStatus, "archived">;
  expectedPublishedRevisionId: string | null;
  attemptCount: number;
  claimToken: string | null;
  claimedAt: string | null;
  completedAt: string | null;
  lastErrorCode: string | null;
  createdAt: string;
  createdBy: string;
}>;

type BlogPublicationScheduleInputBase = Readonly<{
  postId: string;
  expectedVersion: number;
  executeAt: string;
  actor: BlogCmsActor;
}>;

export type ScheduleBlogPublicationInput =
  | (BlogPublicationScheduleInputBase &
      Readonly<{
        action: "publish";
        revisionId: string;
      }>)
  | (BlogPublicationScheduleInputBase &
      Readonly<{
        action: "unpublish";
        revisionId?: never;
      }>);

export type CancelBlogPublicationInput = Readonly<{
  scheduleId: string;
  actor: BlogCmsActor;
}>;

export type BlogPublicationRunResult = Readonly<{
  claimed: number;
  completed: number;
  failed: number;
  rescheduled: number;
  affectedSlugs: readonly string[];
}>;

export type BlogCmsMaintenanceResult = Readonly<{
  recoveredSchedules: number;
  failedSchedules: number;
  archivedMedia: number;
  prunedRevisions: number;
}>;

export type LegacyBlogPostSeed = Readonly<{
  postId: string;
  revisionId: string;
  slug: string;
  publishedAt: string;
  revision: BlogPostRevisionInput;
}>;

export type LegacyBlogCmsSeed = Readonly<{
  mediaAssets: readonly (BlogMediaAssetInput & Readonly<{ id: string }>)[];
  posts: readonly LegacyBlogPostSeed[];
}>;
