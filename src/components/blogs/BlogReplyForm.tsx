"use client";

import { useState, type FormEvent } from "react";
import styles from "./BlogPages.module.css";

export default function BlogReplyForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <form className={styles.replyForm} id="reply-form" onSubmit={handleSubmit}>
      <div className={styles.replyGrid}>
        <label htmlFor="blog-reply-name">
          <span>Name *</span>
          <input id="blog-reply-name" type="text" name="name" autoComplete="name" required />
        </label>
        <label htmlFor="blog-reply-email">
          <span>Email *</span>
          <input
            id="blog-reply-email"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </label>
      </div>
      <label htmlFor="blog-reply-website">
        <span>Website</span>
        <input id="blog-reply-website" type="url" name="website" autoComplete="url" />
      </label>
      <label htmlFor="blog-reply-comment">
        <span>Comment *</span>
        <textarea id="blog-reply-comment" name="comment" rows={6} required />
      </label>
      <label className={styles.remember} htmlFor="blog-reply-remember">
        <input id="blog-reply-remember" type="checkbox" name="remember" />
        <span>Save my name, email, and website in this browser for the next time I comment.</span>
      </label>
      <button className={styles.commentButton} type="submit">
        <span>Post Comment</span>
      </button>
      <p className={styles.replyStatus} aria-live="polite">
        {submitted ? "Your comment has been prepared for moderation." : ""}
      </p>
    </form>
  );
}
