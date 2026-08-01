import type { ApprovedBlogComment } from "@/contracts/blog-comments";
import styles from "./BlogPages.module.css";

type BlogCommentsProps = {
  comments: readonly ApprovedBlogComment[];
};

const commentDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

function commentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { dateTime: undefined, label: "Date unavailable" };
  }

  return {
    dateTime: date.toISOString(),
    label: commentDateFormatter.format(date),
  };
}

function commentInitial(authorName: string) {
  return Array.from(authorName.trim())[0]?.toLocaleUpperCase("en-US") ?? "?";
}

function safeWebsiteUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (url.username || url.password) return null;

    return url.toString();
  } catch {
    return null;
  }
}

export default function BlogComments({ comments }: BlogCommentsProps) {
  if (comments.length === 0) {
    return (
      <p className={styles.commentsEmpty}>
        No approved comments yet. Share your perspective using the form below.
      </p>
    );
  }

  return (
    <ul className={styles.commentsList}>
      {comments.map((comment) => {
        const websiteUrl = safeWebsiteUrl(comment.websiteUrl);
        const createdAt = commentDate(comment.createdAt);

        return (
          <li key={comment.id}>
            <article className={styles.comment}>
              <span className={styles.commentAvatar} aria-hidden="true">
                {commentInitial(comment.authorName)}
              </span>
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <h3>
                    {websiteUrl ? (
                      <a
                        className={styles.commentAuthorLink}
                        href={websiteUrl}
                        target="_blank"
                        rel="ugc nofollow noreferrer noopener"
                        aria-label={`Visit ${comment.authorName}'s website (opens in a new tab)`}
                      >
                        By {comment.authorName}
                      </a>
                    ) : (
                      <>By {comment.authorName}</>
                    )}
                  </h3>
                  <time dateTime={createdAt.dateTime}>{createdAt.label}</time>
                </div>
                <p>{comment.body}</p>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
