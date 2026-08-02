"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./AdminAuth.module.css";

export function AdminTwoFactorForm() {
  const router = useRouter();
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").replace(/\s+/g, "");

    try {
      const result = useBackupCode
        ? await authClient.twoFactor.verifyBackupCode({
            code,
            disableSession: false,
            trustDevice: false,
          })
        : await authClient.twoFactor.verifyTotp({ code, trustDevice: false });

      if (result.error) {
        setError(
          useBackupCode
            ? "That recovery code is invalid or has already been used."
            : "That authenticator code is invalid or expired.",
        );
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to verify the code. Sign in again if the challenge expired.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="two-factor-code">
          {useBackupCode ? "Recovery code" : "Six-digit authenticator code"}
        </label>
        <input
          className={`${styles.input} ${styles.codeInput}`}
          id="two-factor-code"
          name="code"
          type="text"
          inputMode={useBackupCode ? "text" : "numeric"}
          autoComplete="one-time-code"
          pattern={useBackupCode ? undefined : "[0-9]{6}"}
          minLength={useBackupCode ? 6 : 6}
          maxLength={useBackupCode ? 32 : 6}
          required
          autoFocus
          disabled={pending}
        />
      </div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button className={styles.button} type="submit" disabled={pending}>
        {pending ? "Verifying…" : "Verify and continue"}
      </button>
      <button
        className={styles.textButton}
        type="button"
        disabled={pending}
        onClick={() => {
          setError("");
          setUseBackupCode((current) => !current);
        }}
      >
        {useBackupCode ? "Use an authenticator code" : "Use a recovery code instead"}
      </button>
    </form>
  );
}
