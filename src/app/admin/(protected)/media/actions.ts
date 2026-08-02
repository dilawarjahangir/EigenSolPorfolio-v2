"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  BlogCmsConflictError,
  BlogCmsNotFoundError,
  trashBlogMediaAsset,
} from "@/services/blog-posts/BlogPostService";
import { requireOwner } from "@/services/auth/AdminAuthService";

function safeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/admin/media")) {
    return "/admin/media";
  }

  try {
    const parsed = new URL(value, "https://eigensol.com");
    return parsed.origin === "https://eigensol.com"
      ? `${parsed.pathname}${parsed.search}`
      : "/admin/media";
  } catch {
    return "/admin/media";
  }
}

function redirectWithNotice(returnPath: string, notice: string): never {
  const target = new URL(returnPath, "https://eigensol.com");
  target.searchParams.set("notice", notice);
  redirect(`${target.pathname}${target.search}`);
}

export async function trashBlogMediaAction(formData: FormData) {
  const owner = await requireOwner();
  const mediaId = String(formData.get("mediaId") ?? "");
  const returnPath = safeReturnPath(formData.get("returnTo"));

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mediaId)) {
    redirectWithNotice(returnPath, "invalid-request");
  }

  try {
    await trashBlogMediaAsset(mediaId, { id: owner.userId });
  } catch (error) {
    if (error instanceof BlogCmsNotFoundError) {
      redirectWithNotice(returnPath, "not-found");
    }
    if (error instanceof BlogCmsConflictError && error.code === "media-referenced") {
      redirectWithNotice(returnPath, "referenced");
    }
    redirectWithNotice(returnPath, "failed");
  }

  revalidatePath("/admin/media");
  redirectWithNotice(returnPath, "trashed");
}
