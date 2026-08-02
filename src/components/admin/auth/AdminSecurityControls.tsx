"use client";

import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import {
  logoutAllAdminDevicesAction,
  regenerateRecoveryCodesAction,
  revokeOtherAdminSessionsAction,
  type RecoveryCodeActionState,
} from "@/app/admin/(protected)/settings/security/actions";
import { AdminConfirmButton } from "@/components/admin/AdminConfirmButton";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import ui from "@/components/admin/AdminUi.module.css";
import styles from "./AdminAuth.module.css";

const initialState: RecoveryCodeActionState = { status: "idle" };

export function AdminSecurityControls() {
  const [state, regenerateAction] = useActionState(regenerateRecoveryCodesAction, initialState);

  return (
    <div className={ui.dashboardGrid}>
      <section className={ui.panel} aria-labelledby="recovery-code-heading">
        <div className={ui.panelHeader}>
          <h2 id="recovery-code-heading">Recovery codes</h2>
          <KeyRound aria-hidden="true" />
        </div>
        <p className={ui.description}>
          Regenerating codes permanently invalidates every previous recovery code.
        </p>
        <form action={regenerateAction} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="recovery-password">Current password</label>
            <input
              className={styles.input}
              id="recovery-password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={12}
              maxLength={128}
              required
            />
          </div>
          {state.status === "error" ? <p className={styles.error} role="alert">{state.message}</p> : null}
          {state.status === "success" ? (
            <div className={ui.successNotice} role="status">
              <strong>Save these one-use codes now. They will not be shown again.</strong>
              <ol className={styles.backupCodes}>
                {state.backupCodes.map((code) => <li key={code}>{code}</li>)}
              </ol>
            </div>
          ) : null}
          <AdminSubmitButton pendingLabel="Regenerating…" tone="secondary">
            Regenerate recovery codes
          </AdminSubmitButton>
        </form>
      </section>

      <section className={ui.panel} aria-labelledby="session-security-heading">
        <div className={ui.panelHeader}>
          <h2 id="session-security-heading">Signed-in devices</h2>
          <ShieldCheck aria-hidden="true" />
        </div>
        <p className={ui.description}>
          End other sessions after using a shared device or whenever account access is uncertain.
        </p>
        <div className={ui.inlineActions}>
          <form action={revokeOtherAdminSessionsAction}>
            <AdminConfirmButton
              confirmation="Sign out every other device while keeping this session?"
              pendingLabel="Revoking…"
              tone="secondary"
            >
              Sign out other devices
            </AdminConfirmButton>
          </form>
          <form action={logoutAllAdminDevicesAction}>
            <AdminConfirmButton
              confirmation="Sign out every device, including this one?"
              pendingLabel="Signing out…"
            >
              <LogOut aria-hidden="true" />
              Sign out all devices
            </AdminConfirmButton>
          </form>
        </div>
      </section>
    </div>
  );
}
