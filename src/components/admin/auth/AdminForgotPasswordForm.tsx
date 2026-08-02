"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./AdminAuth.module.css";

export function AdminForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/admin/reset-password",
      });
    } catch {
      // Keep the response indistinguishable from an unknown email or throttled request.
    } finally {
      setComplete(true);
      setPending(false);
    }
  };

  if (complete) {
    return (
      <p className={styles.status} role="status">
        If that address belongs to the admin account, a reset link has been sent.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="reset-email">
          Admin email
        </label>
        <input
          className={styles.input}
          id="reset-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          disabled={pending}
        />
      </div>
      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Requesting link…" : "Send reset link"}
      </button>
    </form>
  );
}
