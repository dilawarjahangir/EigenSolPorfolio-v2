import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, PenLine } from "lucide-react";
import { blogPosts } from "@/data/blogs";
import BlogVideoButton from "./BlogVideoButton";
import styles from "./BlogPages.module.css";

export default function BlogGridPage() {
  return (
    <div className={styles.blogPage}>
      <section className={styles.blogHero} aria-labelledby="blog-page-title">
        <div className={styles.container1330}>
          <div className={styles.blogHeroContent}>
            <p className={`${styles.eyebrow} tp_fade_anim`}>
              EigenSol Insights
              <ArrowRight aria-hidden="true" />
            </p>
            <h1 className={`${styles.blogHeroTitle} tp_fade_anim`} id="blog-page-title">
              Better ideas
              <Image
                src="/agntix-blog/about-us-4-shape-1.png"
                alt=""
                width={65}
                height={65}
                aria-hidden="true"
              />
              <br />
              <a href="#articles" aria-label="Jump to articles">
                <ArrowDown aria-hidden="true" />
              </a>{" "}
              for digital products
            </h1>

            <svg
              className={styles.blogHeroDoodle}
              aria-hidden="true"
              viewBox="0 0 109 109"
              fill="none"
            >
              <path
                d="M46.8918 0.652597C52.0111 11.5756 61.1509 45.3262 42.3414 57.6622C32.5453 63.8237 11.8693 68.6772 1.79348 40.7372C-2.00745 30.1973 6.53261 20.5828 26.243 25.965C37.6149 29.0703 65.0949 36.1781 78.8339 57.5398C86.0851 68.8141 93.074 92.3859 89.9278 107.942M89.9278 107.942C90.8943 100.431 95.9994 85.8585 108.687 87.6568M89.9278 107.942C90.4304 103.013 86.878 91.2724 68.6481 83.7468M63.5129 27.0092C68.0375 28.7613 82.5356 36.982 88.0712 51.886"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className={styles.blogGridSection} id="articles" aria-label="EigenSol articles">
        <div className={styles.container1330}>
          <div className={styles.blogGrid}>
            {blogPosts.map((post) => (
              <article className={styles.blogCard} key={post.slug}>
                <div className={styles.blogCardTop}>
                  <div className={styles.authorSummary}>
                    <Image src={post.authorImage} alt="" width={42} height={42} />
                    <div>
                      <strong>{post.author}</strong>
                      <span>{post.authorRole}</span>
                    </div>
                  </div>
                  <time dateTime={post.publishedAt}>
                    <Clock3 aria-hidden="true" />
                    {post.date}
                  </time>
                </div>

                <div className={styles.blogMedia}>
                  <Link href={`/blogs/${post.slug}`} aria-label={`Read ${post.title}`}>
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 620px, calc(100vw - 60px)"
                    />
                  </Link>
                  {post.videoId ? <BlogVideoButton videoId={post.videoId} /> : null}
                </div>

                <div className={styles.blogCardContent}>
                  <p className={styles.blogCategory}>
                    <PenLine aria-hidden="true" />
                    {post.category}
                  </p>
                  <h2 className={styles.blogCardTitle}>
                    <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <Link className={styles.readMore} href={`/blogs/${post.slug}`}>
                    Read More
                    <span aria-hidden="true">
                      <ArrowUpRight />
                      <ArrowUpRight />
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <nav className={styles.pagination} aria-label="Blog pagination">
            <span aria-current="page">1</span>
            <Link href="/blogs?page=2">2</Link>
            <Link href="/blogs?page=3">3</Link>
            <Link href="/blogs?page=2" aria-label="Next blog page">
              <ArrowRight aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </section>
    </div>
  );
}
