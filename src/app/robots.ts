import type { MetadataRoute } from "next";
import { absoluteUrl, seoConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin", "/api/auth", "/blog-comments/moderate"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: seoConfig.origin,
  };
}
