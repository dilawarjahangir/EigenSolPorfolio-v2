import { getActiveManagedBlogMediaFile } from "@/services/blog-media/BlogMediaStorageService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MediaRouteContext = Readonly<{
  params: Promise<{ key: string }>;
}>;

const missingHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "text/plain; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

function entityTagMatches(value: string | null, entityTag: string) {
  if (!value) return false;

  return value.split(",").some((candidate) => {
    const normalized = candidate.trim().replace(/^W\//, "");
    return normalized === "*" || normalized === entityTag;
  });
}

function publicMediaHeaders(file: Awaited<ReturnType<typeof getActiveManagedBlogMediaFile>>) {
  if (!file) return null;

  return {
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(file.byteSize),
    "Content-Type": "image/webp",
    ETag: file.etag,
    "Last-Modified": file.lastModified.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  };
}

async function serveManagedMedia(
  request: Request,
  context: MediaRouteContext,
  includeBody: boolean,
) {
  const { key } = await context.params;

  try {
    const file = await getActiveManagedBlogMediaFile(key, includeBody);
    if (!file) return new Response("Not found", { status: 404, headers: missingHeaders });

    const headers = publicMediaHeaders(file);
    if (!headers) return new Response("Not found", { status: 404, headers: missingHeaders });

    if (entityTagMatches(request.headers.get("if-none-match"), file.etag)) {
      const notModifiedHeaders = new Headers(headers);
      notModifiedHeaders.delete("Content-Length");
      return new Response(null, { status: 304, headers: notModifiedHeaders });
    }

    const body = includeBody && file.body ? new Uint8Array(file.body) : null;
    return new Response(body, { status: 200, headers });
  } catch {
    return new Response("Media unavailable", {
      status: 500,
      headers: { ...missingHeaders, "Cache-Control": "private, no-store, max-age=0" },
    });
  }
}

export async function GET(request: Request, context: MediaRouteContext) {
  return serveManagedMedia(request, context, true);
}

export async function HEAD(request: Request, context: MediaRouteContext) {
  return serveManagedMedia(request, context, false);
}
