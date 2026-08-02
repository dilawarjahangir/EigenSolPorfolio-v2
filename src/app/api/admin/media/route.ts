import { requireOwner } from "@/services/auth/AdminAuthService";
import {
  BlogMediaUploadError,
  uploadManagedBlogMedia,
  type ManagedBlogMediaUpload,
} from "@/services/blog-media/BlogMediaStorageService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = 11 * 1024 * 1024;
const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive, noimageindex",
};

function errorResponse(status: number, code: string, message: string) {
  return Response.json(
    { ok: false, error: { code, message } },
    { status, headers: responseHeaders },
  );
}

function isManagedUpload(value: FormDataEntryValue | null): value is File & ManagedBlogMediaUpload {
  return (
    value !== null &&
    typeof value !== "string" &&
    typeof value.name === "string" &&
    typeof value.size === "number" &&
    typeof value.type === "string" &&
    typeof value.arrayBuffer === "function"
  );
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("multipart/form-data;")) {
    return errorResponse(415, "multipart-required", "Upload an image using multipart form data.");
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_MULTIPART_BYTES) {
    return errorResponse(413, "request-too-large", "The upload request is too large.");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(400, "invalid-multipart", "The upload form could not be read.");
  }

  const upload = formData.get("file");
  if (!isManagedUpload(upload)) {
    return errorResponse(400, "file-required", "Choose an image to upload.");
  }

  try {
    const result = await uploadManagedBlogMedia(upload, { id: owner.userId });
    return Response.json(
      { ok: true, asset: result.asset, duplicate: result.duplicate },
      { status: result.duplicate ? 200 : 201, headers: responseHeaders },
    );
  } catch (error) {
    if (error instanceof BlogMediaUploadError) {
      const status = error.code === "media-conflict" ? 409 : 400;
      return errorResponse(status, error.code, error.message);
    }

    return errorResponse(500, "upload-failed", "The image could not be stored. Try again.");
  }
}
