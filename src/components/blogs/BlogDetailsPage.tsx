import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Mail,
  MessageCircle,
  Quote,
  Tag,
} from "lucide-react";
import type { SVGProps } from "react";
import type { BlogPost } from "@/data/blogs";
import BlogComments from "./BlogComments";
import BlogReplyForm from "./BlogReplyForm";
import styles from "./BlogPages.module.css";

type BlogDetailsPageProps = {
  post: BlogPost;
  nextPost: BlogPost;
};

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

export default function BlogDetailsPage({ post, nextPost }: BlogDetailsPageProps) {
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
              <span>{post.readTime}</span>
            </div>
            <h1>{post.title}</h1>
            <div className={styles.detailsMeta}>
              <div className={styles.detailsAuthor}>
                <Image src={post.authorImage} alt="" width={42} height={42} />
                <strong>{post.author}</strong>
              </div>
              <time dateTime={post.publishedAt}>
                <Clock3 aria-hidden="true" />
                {post.date}
              </time>
              <span>
                <MessageCircle aria-hidden="true" />3 comments
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.articleArea}>
        <div className={styles.container1750}>
          <div className={styles.detailsBanner}>
            <Image
              src="/agntix-blog/blog-details-banner.jpg"
              alt=""
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
              <div className={styles.articleText}>
                <p>
                  Reliable digital products are rarely the result of one perfect framework or one
                  major technical decision. They come from a sequence of clear choices about
                  outcomes, constraints, ownership, and the feedback a team needs to keep improving.
                </p>
                <p>
                  The useful question is not whether a system can scale in theory. It is whether the
                  team can change it safely, understand its behavior in production, and keep the
                  product aligned with the business as both evolve.
                </p>
              </div>

              <section className={styles.articleSection}>
                <h2>Start with the decision</h2>
                <p>
                  Before choosing an architecture, define the decision it must support. A good
                  technical direction makes the next important product change easier without
                  introducing operating costs the business cannot justify.
                </p>
              </section>

              <div className={styles.articleImagePair}>
                <Image
                  src="/agntix-blog/blog-details-sm-1.jpg"
                  alt=""
                  width={405}
                  height={420}
                />
                <Image
                  src="/agntix-blog/blog-details-sm-2.jpg"
                  alt=""
                  width={405}
                  height={420}
                />
              </div>

              <p className={styles.articleParagraph}>
                Product, design, and engineering constraints should be discussed together. When
                those constraints remain hidden, teams optimize different parts of the same system
                and discover the conflicts only after delivery becomes expensive.
              </p>

              <blockquote className={styles.articleQuote}>
                <Quote aria-hidden="true" />
                <div>
                  <p>
                    Success comes from clear outcomes, disciplined execution, learning from
                    failure, and the persistence to improve the system.
                  </p>
                  <cite>EigenSol Engineering</cite>
                </div>
              </blockquote>

              <p className={styles.articleParagraph}>
                The strongest systems make quality visible. Teams can see what changed, understand
                what failed, and connect technical behavior to the customer or operational outcome
                that matters.
              </p>

              <section className={styles.articleSection}>
                <h2>Make constraints visible</h2>
                <p>
                  A practical engineering brief records the assumptions that could change the
                  solution. It gives the team a shared basis for evaluating scope and tradeoffs.
                </p>
              </section>

              <div className={styles.articleList}>
                <p>A useful decision record should include:</p>
                <ul>
                  <li>The product outcome and the metric that demonstrates progress.</li>
                  <li>The operational, security, data, and integration constraints.</li>
                  <li>The expected load profile and realistic growth assumptions.</li>
                  <li>The rollback, observability, and ownership model after release.</li>
                </ul>
              </div>

              <pre className={styles.codeBlock}>
                <code>{`type ProductDecision = {
  outcome: string;
  constraint: string;
  successSignal: string;
  owner: string;
};`}</code>
              </pre>

              <p className={styles.articleParagraph}>
                This level of clarity does not slow delivery. It reduces ambiguity, prevents
                accidental complexity, and gives every discipline a more useful way to challenge
                the plan before implementation.
              </p>

              <div className={styles.articleTagRow}>
                <div className={styles.tagCloud}>
                  <strong>Tagged with:</strong>
                  <Link href="/blogs">Engineering</Link>
                  <Link href="/blogs">Product</Link>
                  <Link href="/blogs">Architecture</Link>
                  <Link href="/blogs">Delivery</Link>
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
                  src="/agntix-blog/blog-av-1.jpg"
                  alt=""
                  width={100}
                  height={100}
                />
                <div>
                  <span>About Author</span>
                  <h2>EigenSol Engineering</h2>
                  <p>
                    EigenSol designs and delivers software, web, mobile, cloud, and AI systems for
                    teams that need reliable products and measurable operating outcomes.
                  </p>
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

        <div className={styles.container1750}>
          <Link className={styles.nextPost} href={`/blogs/${nextPost.slug}`}>
            <div className={styles.nextPostImage}>
              <Image
                src="/agntix-blog/blog-details-2.jpg"
                alt=""
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

        <div className={styles.container1330}>
          <div className={styles.commentsWrap}>
            <section className={styles.commentsSection}>
              <h2>Comments (03)</h2>
              <BlogComments />
            </section>

            <section className={styles.replySection}>
              <h2>Leave a Reply</h2>
              <p>Your email address will not be published. Required fields are marked *</p>
              <BlogReplyForm />
            </section>
          </div>
        </div>
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
