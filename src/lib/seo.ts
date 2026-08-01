import type { Metadata } from "next";

export const seoConfig = {
  name: "EigenSol",
  legalName: "EigenSol",
  origin: "https://eigensol.com",
  locale: "en_US",
  language: "en",
  description:
    "EigenSol builds resilient custom software, web and mobile products, AI solutions, and cloud platforms for businesses worldwide.",
  email: "info@eigensol.com",
  telephone: "+923260335144",
  address: {
    streetAddress: "3570 N2 Block, Khayaban-e-Amin",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  socialProfiles: [
    "https://www.facebook.com/people/EigenSol/61572598540107/",
    "https://www.instagram.com/eigensol.official",
    "https://linkedin.com/company/eigensol",
  ],
  defaultImage: "/opengraph-image",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, seoConfig.origin).toString();
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  image = seoConfig.defaultImage,
  type = "website",
  publishedTime,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          title,
          description,
          url: canonical,
          siteName: seoConfig.name,
          locale: seoConfig.locale,
          publishedTime,
          images: [{ url: imageUrl, alt: title }],
        }
      : {
          type: "website",
          title,
          description,
          url: canonical,
          siteName: seoConfig.name,
          locale: seoConfig.locale,
          images: [{ url: imageUrl, alt: title }],
        };

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
  };
}

export type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdObject
  | readonly JsonLdValue[];
export type JsonLdObject = { readonly [key: string]: JsonLdValue | undefined };

export const organizationId = `${seoConfig.origin}/#organization`;
export const websiteId = `${seoConfig.origin}/#website`;

export function siteJsonLd(): JsonLdObject {
  const organization = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": organizationId,
    name: seoConfig.name,
    legalName: seoConfig.legalName,
    url: seoConfig.origin,
    logo: absoluteUrl("/logo.webp"),
    image: absoluteUrl(seoConfig.defaultImage),
    description: seoConfig.description,
    email: seoConfig.email,
    telephone: seoConfig.telephone,
    address: {
      "@type": "PostalAddress",
      ...seoConfig.address,
    },
    sameAs: seoConfig.socialProfiles,
    areaServed: "Worldwide",
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: seoConfig.origin,
    name: seoConfig.name,
    description: seoConfig.description,
    publisher: { "@id": organizationId },
    inLanguage: seoConfig.language,
  };

  return { "@context": "https://schema.org", "@graph": [organization, website] };
}

export function breadcrumbJsonLd(
  items: readonly { name: string; path: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageJsonLd(
  type: "AboutPage" | "ContactPage" | "WebPage",
  name: string,
  description: string,
  path: string,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": websiteId },
    about: { "@id": organizationId },
    inLanguage: seoConfig.language,
  };
}

export function collectionJsonLd(
  name: string,
  description: string,
  path: string,
  items: readonly { name: string; path: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#collection`,
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": websiteId },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

export function serviceJsonLd(service: {
  title: string;
  shortDescription: string;
  slug: string;
}): JsonLdObject {
  const url = absoluteUrl(`/services/${service.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.title,
    description: service.shortDescription,
    url,
    provider: { "@id": organizationId },
    areaServed: "Worldwide",
    serviceType: service.title,
  };
}

export function articleJsonLd(post: {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  image: string;
}): JsonLdObject {
  const url = absoluteUrl(`/blogs/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.image),
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@id": organizationId },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    url,
    inLanguage: seoConfig.language,
  };
}

export function creativeWorkJsonLd(project: {
  id: string;
  title: string;
  description: string;
  primaryCategory: string;
  tags: readonly string[];
  coverImage?: string;
}): JsonLdObject {
  const url = absoluteUrl(`/case-studies/${project.id}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#case-study`,
    name: project.title,
    description: project.description,
    url,
    image: project.coverImage ? absoluteUrl(project.coverImage) : undefined,
    genre: project.primaryCategory,
    keywords: project.tags.join(", "),
    creator: { "@id": organizationId },
    publisher: { "@id": organizationId },
    inLanguage: seoConfig.language,
  };
}
