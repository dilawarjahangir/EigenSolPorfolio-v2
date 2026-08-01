import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blogs";
import { portfolioProjects } from "@/data/projects";
import { serviceOfferings } from "@/data/services";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
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
  const blogs: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blogs/${post.slug}`),
    lastModified: post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...services, ...projects, ...blogs];
}
