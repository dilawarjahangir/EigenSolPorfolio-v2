import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Mail,
  MessageCircle,
  Tag,
} from "lucide-react";
import type { SVGProps } from "react";
import type { BlogPostDetail, BlogPostSummary } from "@/contracts/blog-cms";
import type { ApprovedBlogComment } from "@/contracts/blog-comments";
import { BlogContentRenderer } from "./BlogContentRenderer";
import BlogComments from "./BlogComments";
import BlogReplyForm from "./BlogReplyForm";
import styles from "./BlogPages.module.css";

type BlogDetailsPageProps = {
  post: BlogPostDetail;
  nextPost: BlogPostSummary | null;
  comments: readonly ApprovedBlogComment[];
  preview?: boolean;
};

const postDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

function postDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : postDateFormatter.format(date);
}

function mediaAlt(
  media: BlogPostSummary["image"],
  fallback: string,
) {
  if (!media) return fallback;
  return media.decorative ? "" : media.altText || fallback;
}

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/EigenSol/61572598540107/",
    icon: FacebookIcon,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/eigensol",
    icon: LinkedInIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/eigensol.official",
    icon: InstagramIcon,
  },
  {
    label: "Email",
    href: "mailto:info@eigensol.com",
    icon: Mail,
  },
] as const;

export default function BlogDetailsPage({
  post,
  nextPost,
  comments,
  preview = false,
}: BlogDetailsPageProps) {
  const commentCountLabel = `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`;

  return (
    <article className={styles.detailsPage}>
      <header className={styles.detailsHero}>
        <div className={styles.container1230}>
          <div className={styles.detailsHeading}>
            <div className={styles.detailsTags}>
              <span>
                <Tag aria-hidden="true" />
                {post.category}
              </span>
              <span>{post.readTimeMinutes} min read</span>
            </div>
            <h1>{post.title}</h1>
            <div className={styles.detailsMeta}>
              <div className={styles.detailsAuthor}>
                <Image
                  src={
                    post.authorImage?.asset.publicUrl ??
                    "/agntix-blog/blog-masonry-user-1.jpg"
                  }
                  alt={mediaAlt(post.authorImage, post.author)}
                  width={42}
                  height={42}
                />
                <strong>{post.author}</strong>
              </div>
              <time dateTime={post.publishedAt}>
                <Clock3 aria-hidden="true" />
                {postDate(post.publishedAt)}
              </time>
              <span>
                <MessageCircle aria-hidden="true" />
                {commentCountLabel}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.articleArea}>
        <div className={styles.container1750}>
          <div className={styles.detailsBanner}>
            <Image
              src={
                post.heroImage?.asset.publicUrl ??
                post.image?.asset.publicUrl ??
                "/agntix-blog/blog-details-banner.jpg"
              }
              alt={mediaAlt(
                post.heroImage ?? post.image,
                `Hero image for ${post.title}`,
              )}
              fill
              priority
              sizes="(min-width: 1800px) 1720px, calc(100vw - 30px)"
              data-speed=".8"
            />
          </div>
        </div>

        <div className={styles.container1230}>
          <div className={styles.articleGrid}>
            <aside className={styles.shareRail} aria-label="Share and follow EigenSol">
              {socialLinks.map(({ label, href, icon: Icon }, index) => (
                <div
                  className="tp_fade_anim"
                  data-delay={String(0.9 - index * 0.2)}
                  data-fade-from="top"
                  data-ease="bounce"
                  key={label}
                >
                  <a
                    href={href}
                    aria-label={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                </div>
              ))}
            </aside>

            <div className={styles.articleBody}>
              <BlogContentRenderer content={post.content.doc} media={post.media} />

              <div className={styles.articleTagRow}>
                <div className={styles.tagCloud}>
                  <strong>Tagged with:</strong>
                  {post.tags.length ? (
                    post.tags.map((tag) => <Link href="/blogs" key={tag}>{tag}</Link>)
                  ) : (
                    <Link href="/blogs">{post.category}</Link>
                  )}
                </div>
                <div className={styles.inlineSocials}>
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      href={href}
                      aria-label={label}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                      key={label}
                    >
                      <Icon aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>

              <div className={styles.authorPanel}>
                <Image
                  src={
                    post.authorProfileImage?.asset.publicUrl ??
                    post.authorImage?.asset.publicUrl ??
                    "/agntix-blog/blog-av-1.jpg"
                  }
                  alt={mediaAlt(
                    post.authorProfileImage ?? post.authorImage,
                    `Portrait of ${post.author}`,
                  )}
                  width={100}
                  height={100}
                />
                <div>
                  <span>About Author</span>
                  <h2>{post.author}</h2>
                  <p>{post.authorBio}</p>
                  <div className={styles.authorSocials}>
                    {socialLinks.map(({ label, href, icon: Icon }) => (
                      <a
                        href={href}
                        aria-label={label}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                        key={label}
                      >
                        <Icon aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div aria-hidden="true" />
          </div>
        </div>

        {nextPost ? (
          <div className={styles.container1750}>
            <Link className={styles.nextPost} href={`/blogs/${nextPost.slug}`}>
              <div className={styles.nextPostImage}>
                <Image
                  src={
                    nextPost.image?.asset.publicUrl ??
                    "/agntix-blog/blog-details-2.jpg"
                  }
                  alt={mediaAlt(nextPost.image, `Cover image for ${nextPost.title}`)}
                  fill
                  sizes="(min-width: 1800px) 1720px, calc(100vw - 30px)"
                  data-speed=".8"
                />
              </div>
              <div className={styles.nextPostContent}>
                <span>Next Post</span>
                <h2>{nextPost.title}</h2>
              </div>
            </Link>
          </div>
        ) : null}

        {!preview ? (
          <div className={styles.container1330}>
            <div className={styles.commentsWrap}>
              <section className={styles.commentsSection}>
                <h2>Comments ({comments.length})</h2>
                <BlogComments comments={comments} />
              </section>

              <section className={styles.replySection}>
                <h2>Leave a Comment</h2>
                <p>
                  Your email address will not be published. Comments are reviewed before appearing.
                  Required fields are marked *
                </p>
                <BlogReplyForm postSlug={post.slug} />
              </section>
            </div>
          </div>
        ) : null}
      </section>
    </article>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14 8.5V6.8c0-1 .7-1.3 1.4-1.3H18V2.1c-.5-.1-2-.1-3.1-.1C11.8 2 10 3.8 10 7v1.5H7V12h3v10h4V12h3.1l.5-3.5H14Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5.2 7.8H1.6V22h3.6V7.8ZM3.4 2A2.2 2.2 0 1 0 3.4 6.4 2.2 2.2 0 0 0 3.4 2ZM22 14.2c0-4.3-2.3-6.7-5.4-6.7-2.5 0-3.6 1.4-4.2 2.3v-2H8.8V22h3.6v-7.1c0-1.9.4-3.7 2.7-3.7 2.3 0 2.3 2.1 2.3 3.8v7H22v-7.8Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}
