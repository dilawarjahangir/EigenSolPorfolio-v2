import "server-only";

import type {
  BlogMediaRole,
  BlogPostAdminRecord,
  BlogPostDetail,
  BlogPostRevision,
} from "@/contracts/blog-cms";

function mediaForRole(revision: BlogPostRevision, role: BlogMediaRole) {
  return revision.media.find((reference) => reference.role === role) ?? null;
}

export function buildBlogPostPreview(
  post: BlogPostAdminRecord,
  revision: BlogPostRevision = post.currentRevision,
): BlogPostDetail {
  return {
    id: post.id,
    slug: revision.slug,
    status: post.status,
    version: post.version,
    revisionId: revision.id,
    title: revision.title,
    category: revision.category,
    excerpt: revision.excerpt,
    publishedAt: post.firstPublishedAt ?? post.createdAt,
    modifiedAt: post.contentModifiedAt,
    readTimeMinutes: revision.readTimeMinutes,
    author: revision.author,
    authorRole: revision.authorRole,
    authorImage: mediaForRole(revision, "byline-avatar"),
    image: mediaForRole(revision, "cover"),
    videoId: revision.videoId ?? null,
    authorBio: revision.authorBio,
    authorProfileImage: mediaForRole(revision, "author-profile"),
    heroImage: mediaForRole(revision, "hero"),
    socialImage: mediaForRole(revision, "social") ?? mediaForRole(revision, "cover"),
    tags: revision.tags,
    content: revision.content,
    media: revision.media,
    seoTitle: revision.seoTitle ?? null,
    seoDescription: revision.seoDescription ?? null,
  };
}
