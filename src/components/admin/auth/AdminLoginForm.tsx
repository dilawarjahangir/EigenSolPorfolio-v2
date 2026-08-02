"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./AdminAuth.module.css";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError("Unable to sign in. Check your credentials and try again.");
        return;
      }

      if (result.data && "twoFactorRedirect" in result.data) {
        router.replace("/admin/two-factor");
        return;
      }

      router.replace(
        result.data?.user.twoFactorEnabled === true
          ? "/admin"
          : "/admin/settings/security",
      );
      router.refresh();
    } catch {
      setError("Unable to reach the authentication service. Try again shortly.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-email">
          Admin email
        </label>
        <input
          className={styles.input}
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          disabled={pending}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-password">
          Password
        </label>
        <input
          className={styles.input}
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          maxLength={128}
          required
          disabled={pending}
        />
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Continue securely"}
      </button>
    </form>
  );
}
