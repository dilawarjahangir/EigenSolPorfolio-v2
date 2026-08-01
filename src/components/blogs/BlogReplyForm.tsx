"use client";

import { useState, type FormEvent } from "react";
import { submitWebsiteForm } from "@/lib/form-submission";
import styles from "./BlogPages.module.css";

type BlogReplyFormProps = {
  postSlug: string;
};

type SubmissionStatus = {
  state: "idle" | "submitting" | "success" | "error";
  message: string;
};

export default function BlogReplyForm({ postSlug }: BlogReplyFormProps) {
  const [status, setStatus] = useState<SubmissionStatus>({ state: "idle", message: "" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    setStatus({ state: "submitting", message: "Sending your comment for review…" });

    try {
      const result = await submitWebsiteForm({
        kind: "blog-comment",
        companyUrl: "",
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        website: String(formData.get("website") || ""),
        comment: String(formData.get("comment") || ""),
        postSlug,
      });

      if (result.status !== 201) {
        throw new Error("We couldn't submit your comment. Please refresh the page and try again.");
      }

      form.reset();
      setStatus({
        state: "success",
        message:
          "Thanks — your comment was submitted for moderation. It will appear here after approval.",
      });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "We couldn't send your comment.",
      });
    }
  };

  return (
    <form
      className={styles.replyForm}
      id="reply-form"
      method="post"
      onSubmit={handleSubmit}
      aria-busy={status.state === "submitting"}
      aria-describedby="blog-reply-status"
    >
      <div className={styles.replyGrid}>
        <label htmlFor="blog-reply-name">
          <span>Name *</span>
          <input
            id="blog-reply-name"
            type="text"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label htmlFor="blog-reply-email">
          <span>Email *</span>
          <input
            id="blog-reply-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      </div>
      <label htmlFor="blog-reply-website">
        <span>Website</span>
        <input
          id="blog-reply-website"
          type="url"
          name="website"
          autoComplete="url"
          maxLength={500}
        />
      </label>
      <label htmlFor="blog-reply-comment">
        <span>Comment *</span>
        <textarea
          id="blog-reply-comment"
          name="comment"
          rows={6}
          required
          minLength={10}
          maxLength={3000}
        />
      </label>
      <button
        className={styles.commentButton}
        type="submit"
        disabled={status.state === "submitting"}
      >
        <span>{status.state === "submitting" ? "Submitting…" : "Submit for review"}</span>
      </button>
      <p
        className={styles.replyStatus}
        id="blog-reply-status"
        data-state={status.state}
        role={status.state === "error" ? "alert" : "status"}
        aria-atomic="true"
      >
        {status.message}
      </p>
    </form>
  );
}
