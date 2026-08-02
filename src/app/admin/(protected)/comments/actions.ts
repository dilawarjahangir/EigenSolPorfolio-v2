"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AdminBlogCommentAction } from "@/contracts/blog-comments";
import {
  applyAdminBlogCommentAction,
  getAdminBlogComment,
  retryBlogCommentModerationNotification,
} from "@/services/blog-comments/BlogCommentService";
import { requireOwner } from "@/services/auth/AdminAuthService";

function commentAction(value: FormDataEntryValue | null): AdminBlogCommentAction | null {
  return value === "approved" || value === "rejected" || value === "removed" ? value : null;
}

function safeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/admin/comments")) {
    return "/admin/comments";
  }

  try {
    const parsed = new URL(value, "https://eigensol.com");
    return parsed.origin === "https://eigensol.com"
      ? `${parsed.pathname}${parsed.search}`
      : "/admin/comments";
  } catch {
    return "/admin/comments";
  }
}

function redirectWithNotice(returnPath: string, notice: string): never {
  const target = new URL(returnPath, "https://eigensol.com");
  target.searchParams.set("notice", notice);
  redirect(`${target.pathname}${target.search}`);
}

function refreshCommentPaths(postSlugs: ReadonlySet<string>) {
  revalidatePath("/admin");
  revalidatePath("/admin/comments");
  for (const slug of postSlugs) revalidatePath(`/blogs/${slug}`);
}

export async function moderateBlogCommentAction(formData: FormData) {
  const owner = await requireOwner();
  const commentId = String(formData.get("commentId") ?? "");
  const action = commentAction(formData.get("action"));
  const returnPath = safeReturnPath(formData.get("returnTo"));

  if (!/^[0-9a-f-]{36}$/i.test(commentId) || !action) {
    redirectWithNotice(returnPath, "invalid-request");
  }

  const result = await applyAdminBlogCommentAction(commentId, action, owner.userId);
  if (result.status === "not_found") redirectWithNotice(returnPath, "not-found");
  if (result.status === "conflict") redirectWithNotice(returnPath, "conflict");

  refreshCommentPaths(new Set([result.comment.postSlug]));
  redirectWithNotice(returnPath, action);
}

export async function bulkModerateBlogCommentsAction(formData: FormData) {
  const owner = await requireOwner();
  const action = commentAction(formData.get("action"));
  const returnPath = safeReturnPath(formData.get("returnTo"));
  const commentIds = Array.from(
    new Set(
      formData
        .getAll("commentId")
        .filter((value): value is string => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value)),
    ),
  ).slice(0, 100);

  if (!action || action === "removed" || commentIds.length === 0) {
    redirectWithNotice(returnPath, "invalid-request");
  }

  let applied = 0;
  let conflicts = 0;
  const affectedSlugs = new Set<string>();

  for (const commentId of commentIds) {
    const result = await applyAdminBlogCommentAction(commentId, action, owner.userId);
    if (result.status === "applied") {
      applied += 1;
      affectedSlugs.add(result.comment.postSlug);
    } else {
      conflicts += 1;
    }
  }

  refreshCommentPaths(affectedSlugs);
  redirectWithNotice(returnPath, `bulk-${action}-${applied}-${conflicts}`);
}

export async function retryBlogCommentNotificationAction(formData: FormData) {
  await requireOwner();
  const commentId = String(formData.get("commentId") ?? "");
  const returnPath = safeReturnPath(formData.get("returnTo"));

  if (!/^[0-9a-f-]{36}$/i.test(commentId)) {
    redirectWithNotice(returnPath, "invalid-request");
  }

  const before = await getAdminBlogComment(commentId);
  if (!before) redirectWithNotice(returnPath, "not-found");

  const outcome = await retryBlogCommentModerationNotification(commentId);
  revalidatePath("/admin");
  revalidatePath("/admin/comments");
  redirectWithNotice(returnPath, outcome.status === "sent" ? "notification-sent" : "notification-failed");
}
