export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  publishedAt: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorImage: string;
  image: string;
  excerpt: string;
  videoId?: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "designing-software-that-scales",
    title: "Designing software that scales without slowing teams down",
    category: "Software Architecture",
    date: "July 15, 2026",
    publishedAt: "2026-07-15",
    readTime: "6 min read",
    author: "EigenSol Engineering",
    authorRole: "Engineering Team",
    authorImage: "/agntix-blog/blog-masonry-user-1.jpg",
    image: "/agntix-blog/blog-masonry-thumb-1.jpg",
    excerpt:
      "Practical architecture decisions that keep a growing product understandable, testable, and ready for change.",
  },
  {
    slug: "web-product-mistakes-to-avoid",
    title: "Six web product mistakes to avoid before development starts",
    category: "Product Engineering",
    date: "July 10, 2026",
    publishedAt: "2026-07-10",
    readTime: "5 min read",
    author: "EigenSol Product",
    authorRole: "Product Team",
    authorImage: "/agntix-blog/blog-masonry-user-3.jpg",
    image: "/agntix-blog/blog-masonry-thumb-3.jpg",
    excerpt:
      "How clearer scope, measurable outcomes, and early technical validation prevent expensive product rework.",
  },
  {
    slug: "better-data-intensive-interfaces",
    title: "Eight principles for better data-intensive interfaces",
    category: "UI/UX Systems",
    date: "July 4, 2026",
    publishedAt: "2026-07-04",
    readTime: "7 min read",
    author: "EigenSol Design",
    authorRole: "Design Systems Team",
    authorImage: "/agntix-blog/blog-masonry-user-2.jpg",
    image: "/agntix-blog/blog-masonry-thumb-2.jpg",
    excerpt:
      "Design patterns that make operational dashboards faster to scan, compare, and use repeatedly.",
    videoId: "VCPGMjCW0is",
  },
  {
    slug: "preparing-business-data-for-ai",
    title: "What it takes to prepare business data for useful AI",
    category: "AI & Machine Learning",
    date: "June 26, 2026",
    publishedAt: "2026-06-26",
    readTime: "8 min read",
    author: "EigenSol AI",
    authorRole: "AI Engineering Team",
    authorImage: "/agntix-blog/blog-masonry-user-4.jpg",
    image: "/agntix-blog/blog-masonry-thumb-4.jpg",
    excerpt:
      "A grounded look at data quality, evaluation, governance, and the operational work behind reliable AI.",
  },
  {
    slug: "mobile-products-built-for-real-conditions",
    title: "Building mobile products for real networks and real devices",
    category: "Mobile Development",
    date: "June 18, 2026",
    publishedAt: "2026-06-18",
    readTime: "6 min read",
    author: "EigenSol Mobile",
    authorRole: "Mobile Engineering Team",
    authorImage: "/agntix-blog/blog-masonry-user-5.jpg",
    image: "/agntix-blog/blog-masonry-thumb-7.jpg",
    excerpt:
      "Performance, offline behavior, battery usage, and observability decisions that matter after launch.",
  },
  {
    slug: "cloud-delivery-without-fragile-processes",
    title: "Cloud delivery without fragile deployment processes",
    category: "Cloud & DevOps",
    date: "June 11, 2026",
    publishedAt: "2026-06-11",
    readTime: "5 min read",
    author: "EigenSol Platform",
    authorRole: "Cloud Engineering Team",
    authorImage: "/agntix-blog/blog-masonry-user-6.jpg",
    image: "/agntix-blog/blog-masonry-thumb-8.jpg",
    excerpt:
      "A practical delivery model for repeatable releases, useful telemetry, and safer production changes.",
  },
];

export const getBlogPostBySlug = (slug: string) =>
  blogPosts.find((post) => post.slug === slug);

export const getNextBlogPost = (slug: string) => {
  const index = blogPosts.findIndex((post) => post.slug === slug);
  return blogPosts[(index + 1 + blogPosts.length) % blogPosts.length];
};
