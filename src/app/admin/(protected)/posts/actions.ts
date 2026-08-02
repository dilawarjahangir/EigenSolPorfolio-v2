"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { AdminActionFieldError, AdminPostActionState } from "@/contracts/admin-actions";
import type {
  AdminPostInput,
  BlogEditorDocument,
  BlogEditorNode,
  BlogPostRevisionInput,
  BlogRevisionMediaInput,
} from "@/contracts/blog-cms";
import { requireOwner } from "@/services/auth/AdminAuthService";
import {
  archiveBlogPost,
  BlogCmsConflictError,
  BlogCmsNotFoundError,
  BlogCmsValidationError,
  createBlogPostDraft,
  getActiveBlogPublicationSchedule,
  getBlogPostForEditing,
  getBlogPostRevision,
  publishBlogPost,
  restoreBlogPost,
  unpublishBlogPost,
  updateBlogPostDraft,
} from "@/services/blog-posts/BlogPostService";
import {
  cancelBlogPublication,
  scheduleBlogPublication,
} from "@/services/blog-posts/BlogPublicationService";
import { assertBlogRevisionPublishable } from "@/services/blog-posts/BlogPostValidationService";

const postFormSchema = z.object({
  postId: z.string().trim().optional(),
  expectedVersion: z.coerce.number().int().min(0),
  intent: z.enum(["save", "publish", "schedule"]),
  title: z.string().trim().min(1, "Enter an article title before saving.").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens in the slug."),
  excerpt: z.string().trim().max(500),
  category: z.string().trim().max(100),
  tags: z.string().max(600),
  author: z.string().trim().max(100),
  authorRole: z.string().trim().max(100),
  authorBio: z.string().trim().max(1000),
  videoId: z
    .string()
    .trim()
    .max(32)
    .refine(
      (value) => !value || /^[A-Za-z0-9_-]{6,32}$/.test(value),
      "Use a valid YouTube video ID.",
    ),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(320),
  contentDocument: z.string().min(1).max(250_000),
  scheduleAt: z.string().trim().max(30),
});

const mediaRoles = [
  "cover",
  "hero",
  "social",
  "byline-avatar",
  "author-profile",
] as const;

function stringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function validationState(message: string, field = "form"): AdminPostActionState {
  return {
    status: "validation",
    message: "Review the highlighted content and try again.",
    fieldErrors: [{ field, message }],
  };
}

function publishFieldErrors(parsed: z.infer<typeof postFormSchema>) {
  if (parsed.intent === "save") return [];
  const errors: AdminActionFieldError[] = [];
  if (parsed.title.length < 3) {
    errors.push({ field: "title", message: "Use a descriptive title of at least 3 characters before publishing." });
  }
  if (parsed.excerpt.length < 20) {
    errors.push({ field: "excerpt", message: "Write an excerpt of at least 20 characters before publishing." });
  }
  if (!parsed.category) errors.push({ field: "category", message: "Choose a category before publishing." });
  if (!parsed.author) errors.push({ field: "author", message: "Enter the author name before publishing." });
  if (!parsed.authorRole) errors.push({ field: "authorRole", message: "Enter the author role before publishing." });
  if (parsed.intent === "schedule" && !parsed.scheduleAt) {
    errors.push({ field: "scheduleAt", message: "Choose a publication date and time." });
  }
  return errors;
}

function parseEditorDocument(serialized: string): BlogEditorDocument {
  try {
    const doc = JSON.parse(serialized) as BlogEditorNode;
    return { schemaVersion: 1, doc: doc as BlogEditorDocument["doc"] };
  } catch {
    throw new BlogCmsValidationError("The editor content could not be read.");
  }
}

function bodyMediaFromNode(node: BlogEditorNode, references: BlogRevisionMediaInput[]) {
  if (node.type === "image") {
    const assetId = node.attrs?.assetId;
    if (typeof assetId === "string") {
      references.push({
        mediaId: assetId,
        role: "body",
        position: references.length,
        altText: typeof node.attrs?.alt === "string" ? node.attrs.alt : "",
        decorative: node.attrs?.decorative === true,
        caption: typeof node.attrs?.caption === "string" ? node.attrs.caption : null,
      });
    }
  }

  if (node.type === "managedGallery" && Array.isArray(node.attrs?.items)) {
    for (const item of node.attrs.items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const attributes = item as Record<string, unknown>;
      if (typeof attributes.assetId !== "string") continue;
      references.push({
        mediaId: attributes.assetId,
        role: "body",
        position: references.length,
        altText: typeof attributes.alt === "string" ? attributes.alt : "",
        decorative: attributes.decorative === true,
        caption: typeof attributes.caption === "string" ? attributes.caption : null,
      });
    }
  }

  for (const child of node.content ?? []) bodyMediaFromNode(child, references);
}

function revisionFromForm(
  formData: FormData,
  parsed: z.infer<typeof postFormSchema>,
): BlogPostRevisionInput {
  const content = parseEditorDocument(parsed.contentDocument);
  const media: BlogRevisionMediaInput[] = [];

  for (const role of mediaRoles) {
    const mediaId = stringValue(formData, `${role}MediaId`).trim();
    if (!mediaId) continue;
    media.push({
      mediaId,
      role,
      position: 0,
      altText: stringValue(formData, `${role}AltText`).trim(),
      decorative: formData.get(`${role}Decorative`) === "on",
      caption: null,
    });
  }
  bodyMediaFromNode(content.doc, media);

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    category: parsed.category,
    content,
    tags: [...new Set(parsed.tags.split(",").map((tag) => tag.trim()).filter(Boolean))],
    author: parsed.author,
    authorRole: parsed.authorRole,
    authorBio: parsed.authorBio,
    videoId: parsed.videoId || null,
    seoTitle: parsed.seoTitle || null,
    seoDescription: parsed.seoDescription || null,
    media,
  };
}

function pakistanScheduleToUtc(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new BlogCmsValidationError("Choose a valid publication date and time in Pakistan Standard Time.");
  }
  const date = new Date(`${value}:00+05:00`);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    throw new BlogCmsValidationError("Scheduled publication must be in the future.");
  }
  return date.toISOString();
}

function revalidateBlogRoutes(postId: string, slug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}/edit`);
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);
  revalidatePath("/sitemap.xml");
}

function mapCmsError(error: unknown): AdminPostActionState {
  if (error instanceof BlogCmsValidationError) return validationState(error.message);
  if (error instanceof BlogCmsConflictError) {
    return {
      status: "conflict",
      message: error.message,
      actualVersion: error.actualVersion,
    };
  }
  if (error instanceof BlogCmsNotFoundError) {
    return { status: "error", message: error.message };
  }

  console.error("Admin blog mutation failed", {
    errorName: error instanceof Error ? error.name : "unknown",
  });
  return {
    status: "error",
    message: "The post could not be saved. No published content was changed.",
  };
}

export async function saveBlogPostAction(
  _previousState: AdminPostActionState,
  formData: FormData,
): Promise<AdminPostActionState> {
  const owner = await requireOwner();
  const parsed = postFormSchema.safeParse({
    postId: stringValue(formData, "postId") || undefined,
    expectedVersion: stringValue(formData, "expectedVersion"),
    intent: stringValue(formData, "intent"),
    title: stringValue(formData, "title"),
    slug: stringValue(formData, "slug"),
    excerpt: stringValue(formData, "excerpt"),
    category: stringValue(formData, "category"),
    tags: stringValue(formData, "tags"),
    author: stringValue(formData, "author"),
    authorRole: stringValue(formData, "authorRole"),
    authorBio: stringValue(formData, "authorBio"),
    videoId: stringValue(formData, "videoId"),
    seoTitle: stringValue(formData, "seoTitle"),
    seoDescription: stringValue(formData, "seoDescription"),
    contentDocument: stringValue(formData, "contentDocument"),
    scheduleAt: stringValue(formData, "scheduleAt"),
  });

  if (!parsed.success) {
    return {
      status: "validation",
      message: "Review the form and try again.",
      fieldErrors: parsed.error.issues.map((issue) => ({
        field: String(issue.path[0] ?? "form"),
        message: issue.message,
      })),
    };
  }

  const publishingErrors = publishFieldErrors(parsed.data);
  if (publishingErrors.length) {
    return {
      status: "validation",
      message: "Complete the publishing details and try again.",
      fieldErrors: publishingErrors,
    };
  }

  let scheduleExecuteAt: string | null = null;
  if (parsed.data.intent === "schedule") {
    try {
      scheduleExecuteAt = pakistanScheduleToUtc(parsed.data.scheduleAt);
    } catch (error) {
      if (error instanceof BlogCmsValidationError) {
        return validationState(error.message, "scheduleAt");
      }
      throw error;
    }
  }

  try {
    const actor = { id: owner.userId };
    const revision = revisionFromForm(formData, parsed.data);
    if (parsed.data.intent === "publish" || parsed.data.intent === "schedule") {
      assertBlogRevisionPublishable(revision);
    }
    const postInput: AdminPostInput = {
      postId: parsed.data.postId || null,
      expectedVersion: parsed.data.expectedVersion,
      slug: parsed.data.slug,
      revision,
    };
    let result = postInput.postId
      ? await updateBlogPostDraft({
          postId: postInput.postId,
          expectedVersion: postInput.expectedVersion,
          slug: postInput.slug,
          revision: postInput.revision,
          actor,
        })
      : await createBlogPostDraft({
          slug: postInput.slug,
          revision: postInput.revision,
          actor,
        });

    if (parsed.data.intent === "publish") {
      const activeSchedule = await getActiveBlogPublicationSchedule(result.postId);
      if (activeSchedule?.status === "pending") {
        await cancelBlogPublication({ scheduleId: activeSchedule.id, actor });
      } else if (activeSchedule) {
        throw new BlogCmsConflictError(
          "Publication is already being processed. Refresh before publishing manually.",
          "active-schedule",
        );
      }
      result = await publishBlogPost({
        postId: result.postId,
        expectedVersion: result.version,
        revisionId: result.currentRevisionId,
        actor,
      });
    } else if (parsed.data.intent === "schedule") {
      const activeSchedule = await getActiveBlogPublicationSchedule(result.postId);
      if (activeSchedule?.status === "pending") {
        await cancelBlogPublication({ scheduleId: activeSchedule.id, actor });
      } else if (activeSchedule) {
        throw new BlogCmsConflictError(
          "Publication is already being processed. Refresh before scheduling again.",
          "active-schedule",
        );
      }
      await scheduleBlogPublication({
        postId: result.postId,
        expectedVersion: result.version,
        revisionId: result.currentRevisionId,
        action: "publish",
        executeAt: scheduleExecuteAt!,
        actor,
      });
    }

    revalidateBlogRoutes(result.postId, result.slug);
    return {
      status: "success",
      message:
        parsed.data.intent === "publish"
          ? "The selected revision is published."
          : parsed.data.intent === "schedule"
            ? "The selected revision is scheduled in Pakistan Standard Time."
            : "Draft saved as a new revision.",
      postId: result.postId,
      version: result.version,
      redirectTo: postInput.postId ? undefined : `/admin/posts/${result.postId}/edit`,
    };
  } catch (error) {
    return mapCmsError(error);
  }
}

function requiredMutationFields(formData: FormData) {
  const postId = stringValue(formData, "postId");
  const expectedVersion = Number(stringValue(formData, "expectedVersion"));
  if (!postId || !Number.isSafeInteger(expectedVersion) || expectedVersion <= 0) {
    throw new BlogCmsValidationError("Post mutation details are invalid.");
  }
  return { postId, expectedVersion };
}

export async function archiveBlogPostAction(formData: FormData) {
  const owner = await requireOwner();
  const input = requiredMutationFields(formData);
  await archiveBlogPost({ ...input, actor: { id: owner.userId } });
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?notice=archived");
}

export async function restoreBlogPostAction(formData: FormData) {
  const owner = await requireOwner();
  const input = requiredMutationFields(formData);
  const result = await restoreBlogPost({ ...input, actor: { id: owner.userId } });
  revalidateBlogRoutes(result.postId, result.slug);
  redirect(`/admin/posts/${result.postId}/edit?notice=restored`);
}

export async function unpublishBlogPostAction(formData: FormData) {
  const owner = await requireOwner();
  const input = requiredMutationFields(formData);
  const result = await unpublishBlogPost({ ...input, actor: { id: owner.userId } });
  revalidateBlogRoutes(result.postId, result.slug);
  redirect(`/admin/posts/${result.postId}/edit?notice=unpublished`);
}

export async function cancelBlogScheduleAction(formData: FormData) {
  const owner = await requireOwner();
  const scheduleId = stringValue(formData, "scheduleId");
  const postId = stringValue(formData, "postId");
  if (!scheduleId || !postId) throw new BlogCmsValidationError("Schedule details are invalid.");
  await cancelBlogPublication({ scheduleId, actor: { id: owner.userId } });
  revalidatePath("/admin");
  revalidatePath(`/admin/posts/${postId}/edit`);
}

export async function restoreBlogRevisionAction(formData: FormData) {
  const owner = await requireOwner();
  const { postId, expectedVersion } = requiredMutationFields(formData);
  const revisionId = stringValue(formData, "revisionId");
  const post = await getBlogPostForEditing(postId);
  if (post.version !== expectedVersion) {
    throw new BlogCmsConflictError(
      "The post changed after this revision list loaded.",
      "version-conflict",
      post.version,
    );
  }
  const revision = await getBlogPostRevision(postId, revisionId);
  const result = await updateBlogPostDraft({
    postId,
    expectedVersion,
    slug: revision.slug,
    revision: {
      title: revision.title,
      excerpt: revision.excerpt,
      category: revision.category,
      content: revision.content,
      tags: revision.tags,
      author: revision.author,
      authorRole: revision.authorRole,
      authorBio: revision.authorBio,
      videoId: revision.videoId,
      seoTitle: revision.seoTitle,
      seoDescription: revision.seoDescription,
      readTimeMinutes: revision.readTimeMinutes,
      media: revision.media.map((reference) => ({
        mediaId: reference.mediaId,
        role: reference.role,
        position: reference.position,
        altText: reference.altText,
        decorative: reference.decorative,
        caption: reference.caption,
      })),
    },
    actor: { id: owner.userId },
  });
  revalidatePath(`/admin/posts/${postId}/edit`);
  redirect(`/admin/posts/${postId}/edit?notice=revision-restored&version=${result.version}`);
}
