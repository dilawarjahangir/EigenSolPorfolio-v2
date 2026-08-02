"use client";

import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { AdminSecurityControls } from "./AdminSecurityControls";
import styles from "./AdminAuth.module.css";

type Enrollment = {
  totpUri: string;
  backupCodes: string[];
};

export function AdminTwoFactorSetup() {
  const router = useRouter();
  const session = authClient.useSession();
  const [enrollment, setEnrollment] = useState<Enrollment>();
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let current = true;

    if (!enrollment) {
      return () => {
        current = false;
      };
    }

    void QRCode.toDataURL(enrollment.totpUri, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then((image) => {
        if (current) setQrCode(image);
      })
      .catch(() => {
        if (current) setError("Unable to render the QR code. Use the manual setup URI below.");
      });

    return () => {
      current = false;
    };
  }, [enrollment]);

  if (session.isPending) {
    return (
      <p className={styles.status} role="status">
        Checking two-factor status…
      </p>
    );
  }

  if (!session.data) {
    return (
      <p className={styles.error} role="alert">
        Your session has expired. Sign in again to configure security.
      </p>
    );
  }

  if (session.data.user.twoFactorEnabled === true) {
    return (
      <>
        <p className={styles.status} role="status">
          Two-factor authentication is enabled. A fresh authenticator code is required at every
          sign-in.
        </p>
        <AdminSecurityControls />
      </>
    );
  }

  const beginEnrollment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

    try {
      const result = await authClient.twoFactor.enable({ password });

      if (result.error || !result.data) {
        setError("Unable to start setup. Confirm your password and try again.");
        return;
      }

      setEnrollment({
        totpUri: result.data.totpURI,
        backupCodes: result.data.backupCodes,
      });
    } catch {
      setError("Unable to start setup. Try again shortly.");
    } finally {
      setPending(false);
    }
  };

  const completeEnrollment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").replace(/\s+/g, "");

    try {
      const result = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: false,
      });

      if (result.error) {
        setError("That authenticator code is invalid or expired.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to finish setup. Try again shortly.");
    } finally {
      setPending(false);
    }
  };

  if (!enrollment) {
    return (
      <form className={`${styles.form} ${styles.settingsCard}`} onSubmit={beginEnrollment}>
        <p className={styles.notice}>
          An authenticator app is mandatory for this account. Confirm your password to create
          the one-time setup secret and recovery codes.
        </p>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="setup-password">
            Current password
          </label>
          <input
            className={styles.input}
            id="setup-password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={12}
            maxLength={128}
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
          {pending ? "Creating setup…" : "Set up authenticator"}
        </button>
      </form>
    );
  }

  return (
    <form className={`${styles.form} ${styles.setup} ${styles.settingsCard}`} onSubmit={completeEnrollment}>
      <p className={styles.notice}>
        Scan this QR code in your authenticator app, then save every recovery code offline before
        verifying setup.
      </p>
      {qrCode ? (
        // The URI is intentionally held only in client memory and encoded into this data URL.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.qr}
          src={qrCode}
          alt="QR code for EigenSol Admin authenticator setup"
          width={320}
          height={320}
        />
      ) : (
        <p className={styles.status} role="status">
          Generating QR code…
        </p>
      )}
      <details className={styles.manualCode}>
        <summary>Can’t scan? Show the manual setup URI</summary>
        <code>{enrollment.totpUri}</code>
      </details>
      <div>
        <p className={styles.label}>One-use recovery codes</p>
        <ol className={styles.backupCodes} aria-label="One-use recovery codes">
          {enrollment.backupCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ol>
      </div>
      <label className={styles.check}>
        <input name="saved" type="checkbox" required disabled={pending} />
        <span>I saved these recovery codes in a secure offline location.</span>
      </label>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="setup-code">
          Six-digit authenticator code
        </label>
        <input
          className={`${styles.input} ${styles.codeInput}`}
          id="setup-code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          minLength={6}
          maxLength={6}
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
        {pending ? "Verifying setup…" : "Enable two-factor authentication"}
      </button>
    </form>
  );
}
