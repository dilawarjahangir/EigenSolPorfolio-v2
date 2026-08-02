export const blogCommentStatuses = [
  "pending",
  "approved",
  "rejected",
  "removed",
  "expired",
] as const;

export type BlogCommentStatus = (typeof blogCommentStatuses)[number];

export const blogCommentNotificationStatuses = ["pending", "sent", "failed"] as const;

export type BlogCommentNotificationStatus =
  (typeof blogCommentNotificationStatuses)[number];

export type ApprovedBlogComment = Readonly<{
  id: string;
  authorName: string;
  websiteUrl: string | null;
  body: string;
  createdAt: string;
}>;

export type PendingBlogComment = Readonly<{
  id: string;
  postId: string;
  postSlug: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  websiteUrl: string | null;
  body: string;
  createdAt: string;
  expiresAt: string;
  moderationToken: string;
  notificationAttemptId: string;
}>;

export type BlogCommentModerationPreview = Readonly<{
  postSlug: string;
  postTitle: string;
  authorName: string;
  websiteUrl: string | null;
  body: string;
  createdAt: string;
}>;

export type BlogCommentModerationAction = "approved" | "rejected";

export type AdminBlogCommentAction = BlogCommentModerationAction | "removed";

export type BlogCommentLifecycleAction = AdminBlogCommentAction | "expired";

export type BlogCommentModerationSource = "email_token" | "admin" | "system";

export type BlogCommentModerationResult = Readonly<{
  postSlug: string;
  action: BlogCommentModerationAction;
}>;

export type BlogCommentModerationNotification = Readonly<{
  postSlug: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  websiteUrl: string | null;
  body: string;
  createdAt: string;
  moderationUrl: string;
}>;

export type AdminBlogCommentListQuery = Readonly<{
  status?: BlogCommentStatus;
  postId?: string;
  notificationStatus?: BlogCommentNotificationStatus;
  search?: string;
  cursor?: string;
  limit?: number;
}>;

export type AdminBlogCommentListItem = Readonly<{
  id: string;
  postId: string;
  postSlug: string;
  postTitle: string;
  authorName: string | null;
  bodyPreview: string | null;
  status: BlogCommentStatus;
  createdAt: string;
  moderatedAt: string | null;
  expiresAt: string;
  notificationStatus: BlogCommentNotificationStatus;
}>;

export type AdminBlogCommentListResult = Readonly<{
  items: readonly AdminBlogCommentListItem[];
  nextCursor: string | null;
}>;

export type BlogCommentModerationEvent = Readonly<{
  id: string;
  action: BlogCommentLifecycleAction;
  source: BlogCommentModerationSource;
  actorId: string | null;
  createdAt: string;
}>;

export type AdminBlogCommentDetail = Readonly<
  AdminBlogCommentListItem & {
    authorEmail: string | null;
    websiteUrl: string | null;
    body: string | null;
    notificationAttemptCount: number;
    notificationLastAttemptedAt: string | null;
    notificationSentAt: string | null;
    notificationLastErrorCode: string | null;
    tokenExpiresAt: string | null;
    tokenConsumedAt: string | null;
    moderationEvents: readonly BlogCommentModerationEvent[];
  }
>;

export type AdminBlogCommentStatusCounts = Readonly<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  removed: number;
  expired: number;
  notificationFailures: number;
}>;

export type AdminBlogCommentActionResult = Readonly<{
  id: string;
  postId: string;
  postSlug: string;
  previousStatus: BlogCommentStatus;
  status: BlogCommentStatus;
  moderatedAt: string;
}>;

export type AdminBlogCommentActionOutcome =
  | Readonly<{ status: "applied"; comment: AdminBlogCommentActionResult }>
  | Readonly<{ status: "not_found" }>
  | Readonly<{ status: "conflict"; currentStatus: BlogCommentStatus }>;

export type BlogCommentNotificationRetryOutcome =
  | Readonly<{ status: "sent"; commentId: string }>
  | Readonly<{ status: "failed"; commentId: string }>
  | Readonly<{ status: "not_available" }>;

export type BlogCommentLifecycleMaintenanceResult = Readonly<{
  expiredCount: number;
  purgedTokenCount: number;
  purgedCommentCount: number;
}>;
