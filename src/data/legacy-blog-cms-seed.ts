import type {
  BlogEditorDocument,
  LegacyBlogCmsSeed,
  LegacyBlogPostSeed,
} from "@/contracts/blog-cms";

const MEDIA_IDS = {
  cover1: "30000000-0000-4000-8000-000000000001",
  cover2: "30000000-0000-4000-8000-000000000002",
  cover3: "30000000-0000-4000-8000-000000000003",
  cover4: "30000000-0000-4000-8000-000000000004",
  cover5: "30000000-0000-4000-8000-000000000005",
  cover6: "30000000-0000-4000-8000-000000000006",
  author1: "30000000-0000-4000-8000-000000000011",
  author2: "30000000-0000-4000-8000-000000000012",
  author3: "30000000-0000-4000-8000-000000000013",
  author4: "30000000-0000-4000-8000-000000000014",
  author5: "30000000-0000-4000-8000-000000000015",
  author6: "30000000-0000-4000-8000-000000000016",
  hero: "30000000-0000-4000-8000-000000000021",
  body1: "30000000-0000-4000-8000-000000000022",
  body2: "30000000-0000-4000-8000-000000000023",
  authorProfile: "30000000-0000-4000-8000-000000000024",
  next: "30000000-0000-4000-8000-000000000025",
} as const;

const legacyDocument: BlogEditorDocument = {
  schemaVersion: 1,
  doc: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Reliable digital products are rarely the result of one perfect framework or one major technical decision. They come from a sequence of clear choices about outcomes, constraints, ownership, and the feedback a team needs to keep improving.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The useful question is not whether a system can scale in theory. It is whether the team can change it safely, understand its behavior in production, and keep the product aligned with the business as both evolve.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Start with the decision" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Before choosing an architecture, define the decision it must support. A good technical direction makes the next important product change easier without introducing operating costs the business cannot justify.",
          },
        ],
      },
      {
        type: "managedGallery",
        attrs: {
          items: [
            {
              assetId: MEDIA_IDS.body1,
              src: "/agntix-blog/blog-details-sm-1.jpg",
              alt: "",
              decorative: true,
              caption: null,
              width: 405,
              height: 420,
            },
            {
              assetId: MEDIA_IDS.body2,
              src: "/agntix-blog/blog-details-sm-2.jpg",
              alt: "",
              decorative: true,
              caption: null,
              width: 405,
              height: 420,
            },
          ],
        },
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Product, design, and engineering constraints should be discussed together. When those constraints remain hidden, teams optimize different parts of the same system and discover the conflicts only after delivery becomes expensive.",
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Success comes from clear outcomes, disciplined execution, learning from failure, and the persistence to improve the system.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "EigenSol Engineering",
                marks: [{ type: "italic" }],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The strongest systems make quality visible. Teams can see what changed, understand what failed, and connect technical behavior to the customer or operational outcome that matters.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Make constraints visible" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "A practical engineering brief records the assumptions that could change the solution. It gives the team a shared basis for evaluating scope and tradeoffs.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "A useful decision record should include:" }],
      },
      {
        type: "bulletList",
        content: [
          "The product outcome and the metric that demonstrates progress.",
          "The operational, security, data, and integration constraints.",
          "The expected load profile and realistic growth assumptions.",
          "The rollback, observability, and ownership model after release.",
        ].map((text) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text }] }],
        })),
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "type ProductDecision = {\n  outcome: string;\n  constraint: string;\n  successSignal: string;\n  owner: string;\n};",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This level of clarity does not slow delivery. It reduces ambiguity, prevents accidental complexity, and gives every discipline a more useful way to challenge the plan before implementation.",
          },
        ],
      },
    ],
  },
};

function legacyImage(
  id: string,
  filename: string,
  width: number,
  height: number,
  byteSize: number,
) {
  return {
    id,
    storageKind: "legacy-public" as const,
    storageKey: `legacy/agntix-blog/${filename}`,
    publicUrl: `/agntix-blog/${filename}`,
    originalFilename: filename,
    mimeType: filename.endsWith(".png") ? "image/png" : "image/jpeg",
    width,
    height,
    byteSize,
    checksumSha256: null,
  };
}

const mediaAssets = [
  legacyImage(MEDIA_IDS.cover1, "blog-masonry-thumb-1.jpg", 384, 282, 45_493),
  legacyImage(MEDIA_IDS.cover2, "blog-masonry-thumb-3.jpg", 384, 282, 52_779),
  legacyImage(MEDIA_IDS.cover3, "blog-masonry-thumb-2.jpg", 384, 282, 42_823),
  legacyImage(MEDIA_IDS.cover4, "blog-masonry-thumb-4.jpg", 384, 282, 46_441),
  legacyImage(MEDIA_IDS.cover5, "blog-masonry-thumb-7.jpg", 384, 282, 44_601),
  legacyImage(MEDIA_IDS.cover6, "blog-masonry-thumb-8.jpg", 384, 282, 39_174),
  legacyImage(MEDIA_IDS.author1, "blog-masonry-user-1.jpg", 42, 42, 4_498),
  legacyImage(MEDIA_IDS.author2, "blog-masonry-user-3.jpg", 42, 42, 4_659),
  legacyImage(MEDIA_IDS.author3, "blog-masonry-user-2.jpg", 42, 42, 5_850),
  legacyImage(MEDIA_IDS.author4, "blog-masonry-user-4.jpg", 42, 42, 5_456),
  legacyImage(MEDIA_IDS.author5, "blog-masonry-user-5.jpg", 42, 42, 5_465),
  legacyImage(MEDIA_IDS.author6, "blog-masonry-user-6.jpg", 42, 42, 5_641),
  legacyImage(MEDIA_IDS.hero, "blog-details-banner.jpg", 1920, 1426, 187_453),
  legacyImage(MEDIA_IDS.body1, "blog-details-sm-1.jpg", 405, 420, 45_494),
  legacyImage(MEDIA_IDS.body2, "blog-details-sm-2.jpg", 405, 420, 18_741),
  legacyImage(MEDIA_IDS.authorProfile, "blog-av-1.jpg", 120, 120, 19_320),
  legacyImage(MEDIA_IDS.next, "blog-details-2.jpg", 1720, 1146, 78_116),
] as const;

const sharedAuthorBio =
  "EigenSol designs and delivers software, web, mobile, cloud, and AI systems for teams that need reliable products and measurable operating outcomes.";

function legacyPost(input: Readonly<{
  index: number;
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  readTimeMinutes: number;
  author: string;
  authorRole: string;
  authorMediaId: string;
  coverMediaId: string;
  excerpt: string;
  videoId?: string;
}>): LegacyBlogPostSeed {
  const suffix = String(input.index).padStart(12, "0");

  return {
    postId: `10000000-0000-4000-8000-${suffix}`,
    revisionId: `20000000-0000-4000-8000-${suffix}`,
    slug: input.slug,
    publishedAt: input.publishedAt,
    revision: {
      title: input.title,
      excerpt: input.excerpt,
      category: input.category,
      content: legacyDocument,
      tags: ["Engineering", "Product", "Architecture", "Delivery"],
      author: input.author,
      authorRole: input.authorRole,
      authorBio: sharedAuthorBio,
      videoId: input.videoId ?? null,
      seoTitle: null,
      seoDescription: null,
      readTimeMinutes: input.readTimeMinutes,
      media: [
        {
          mediaId: input.coverMediaId,
          role: "cover",
          position: 0,
          altText: "",
          decorative: true,
        },
        {
          mediaId: input.coverMediaId,
          role: "social",
          position: 0,
          altText: input.title,
          decorative: false,
        },
        {
          mediaId: input.authorMediaId,
          role: "byline-avatar",
          position: 0,
          altText: "",
          decorative: true,
        },
        {
          mediaId: MEDIA_IDS.authorProfile,
          role: "author-profile",
          position: 0,
          altText: "",
          decorative: true,
        },
        {
          mediaId: MEDIA_IDS.hero,
          role: "hero",
          position: 0,
          altText: "",
          decorative: true,
        },
        {
          mediaId: MEDIA_IDS.body1,
          role: "body",
          position: 0,
          altText: "",
          decorative: true,
        },
        {
          mediaId: MEDIA_IDS.body2,
          role: "body",
          position: 1,
          altText: "",
          decorative: true,
        },
        {
          mediaId: MEDIA_IDS.next,
          role: "next",
          position: 0,
          altText: "",
          decorative: true,
        },
      ],
    },
  };
}

const posts = [
  legacyPost({
    index: 1,
    slug: "designing-software-that-scales",
    title: "Designing software that scales without slowing teams down",
    category: "Software Architecture",
    publishedAt: "2026-07-15T00:00:00.000Z",
    readTimeMinutes: 6,
    author: "EigenSol Engineering",
    authorRole: "Engineering Team",
    authorMediaId: MEDIA_IDS.author1,
    coverMediaId: MEDIA_IDS.cover1,
    excerpt:
      "Practical architecture decisions that keep a growing product understandable, testable, and ready for change.",
  }),
  legacyPost({
    index: 2,
    slug: "web-product-mistakes-to-avoid",
    title: "Six web product mistakes to avoid before development starts",
    category: "Product Engineering",
    publishedAt: "2026-07-10T00:00:00.000Z",
    readTimeMinutes: 5,
    author: "EigenSol Product",
    authorRole: "Product Team",
    authorMediaId: MEDIA_IDS.author2,
    coverMediaId: MEDIA_IDS.cover2,
    excerpt:
      "How clearer scope, measurable outcomes, and early technical validation prevent expensive product rework.",
  }),
  legacyPost({
    index: 3,
    slug: "better-data-intensive-interfaces",
    title: "Eight principles for better data-intensive interfaces",
    category: "UI/UX Systems",
    publishedAt: "2026-07-04T00:00:00.000Z",
    readTimeMinutes: 7,
    author: "EigenSol Design",
    authorRole: "Design Systems Team",
    authorMediaId: MEDIA_IDS.author3,
    coverMediaId: MEDIA_IDS.cover3,
    excerpt:
      "Design patterns that make operational dashboards faster to scan, compare, and use repeatedly.",
    videoId: "VCPGMjCW0is",
  }),
  legacyPost({
    index: 4,
    slug: "preparing-business-data-for-ai",
    title: "What it takes to prepare business data for useful AI",
    category: "AI & Machine Learning",
    publishedAt: "2026-06-26T00:00:00.000Z",
    readTimeMinutes: 8,
    author: "EigenSol AI",
    authorRole: "AI Engineering Team",
    authorMediaId: MEDIA_IDS.author4,
    coverMediaId: MEDIA_IDS.cover4,
    excerpt:
      "A grounded look at data quality, evaluation, governance, and the operational work behind reliable AI.",
  }),
  legacyPost({
    index: 5,
    slug: "mobile-products-built-for-real-conditions",
    title: "Building mobile products for real networks and real devices",
    category: "Mobile Development",
    publishedAt: "2026-06-18T00:00:00.000Z",
    readTimeMinutes: 6,
    author: "EigenSol Mobile",
    authorRole: "Mobile Engineering Team",
    authorMediaId: MEDIA_IDS.author5,
    coverMediaId: MEDIA_IDS.cover5,
    excerpt:
      "Performance, offline behavior, battery usage, and observability decisions that matter after launch.",
  }),
  legacyPost({
    index: 6,
    slug: "cloud-delivery-without-fragile-processes",
    title: "Cloud delivery without fragile deployment processes",
    category: "Cloud & DevOps",
    publishedAt: "2026-06-11T00:00:00.000Z",
    readTimeMinutes: 5,
    author: "EigenSol Platform",
    authorRole: "Cloud Engineering Team",
    authorMediaId: MEDIA_IDS.author6,
    coverMediaId: MEDIA_IDS.cover6,
    excerpt:
      "A practical delivery model for repeatable releases, useful telemetry, and safer production changes.",
  }),
] as const;

// The legacy source recorded calendar dates only; midnight UTC keeps imports deterministic.
export const legacyBlogCmsSeed: LegacyBlogCmsSeed = {
  mediaAssets,
  posts,
};
