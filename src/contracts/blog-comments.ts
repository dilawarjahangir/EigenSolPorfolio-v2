export type ApprovedBlogComment = Readonly<{
  id: string;
  authorName: string;
  websiteUrl: string | null;
  body: string;
  createdAt: string;
}>;

export type PendingBlogComment = Readonly<{
  id: string;
  postSlug: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  websiteUrl: string | null;
  body: string;
  createdAt: string;
  moderationToken: string;
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
