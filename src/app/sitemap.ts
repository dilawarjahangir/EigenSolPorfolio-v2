import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { portfolioProjects } from "@/data/projects";
import { serviceOfferings } from "@/data/services";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedBlogSitemapEntries } from "@/services/blog-posts/BlogPostService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const publishedBlogs = await getPublishedBlogSitemapEntries();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/case-studies"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blogs"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/careers"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms-and-conditions"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const services: MetadataRoute.Sitemap = serviceOfferings.map((service) => ({
    url: absoluteUrl(`/services/${service.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const projects: MetadataRoute.Sitemap = portfolioProjects.map((project) => ({
    url: absoluteUrl(`/case-studies/${project.id}`),
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.7,
  }));
  const blogs: MetadataRoute.Sitemap = publishedBlogs.map((post) => ({
    url: absoluteUrl(`/blogs/${post.slug}`),
    lastModified: post.modifiedAt ?? post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...services, ...projects, ...blogs];
}
