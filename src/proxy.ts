import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isAdminPage(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isModerationPage(pathname: string) {
  return pathname === "/blog-comments/moderate";
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  const pageRoute = isAdminPage(pathname) || isModerationPage(pathname);

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "X-Robots-Tag",
    isAdminPage(pathname)
      ? "noindex, nofollow, noarchive, noimageindex"
      : "noindex, nofollow, noarchive",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");

  if (pageRoute) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
    "/blog-comments/moderate",
  ],
};
