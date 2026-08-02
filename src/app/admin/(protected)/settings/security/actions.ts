"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { recordAdminAuditEvent } from "@/services/admin-audit/AdminAuditService";
import { requireOwner } from "@/services/auth/AdminAuthService";

export type RecoveryCodeActionState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "error"; message: string }>
  | Readonly<{ status: "success"; backupCodes: readonly string[] }>;

export async function regenerateRecoveryCodesAction(
  _previousState: RecoveryCodeActionState,
  formData: FormData,
): Promise<RecoveryCodeActionState> {
  const owner = await requireOwner();
  const password = formData.get("password");
  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    return { status: "error", message: "Enter the current account password." };
  }

  try {
    const result = await auth.api.generateBackupCodes({
      headers: await headers(),
      body: { password },
    });
    try {
      await recordAdminAuditEvent({
        actorId: owner.userId,
        action: "security.recovery-codes-regenerated",
        entityType: "admin-account",
        entityId: owner.userId,
      });
    } catch {
      console.error("Recovery-code regeneration audit could not be recorded");
    }
    return { status: "success", backupCodes: result.backupCodes };
  } catch {
    return {
      status: "error",
      message: "Recovery codes could not be regenerated. Confirm the password and try again.",
    };
  }
}

export async function revokeOtherAdminSessionsAction() {
  const owner = await requireOwner();
  await auth.api.revokeOtherSessions({ headers: await headers() });
  try {
    await recordAdminAuditEvent({
      actorId: owner.userId,
      action: "security.other-sessions-revoked",
      entityType: "admin-account",
      entityId: owner.userId,
    });
  } catch {
    console.error("Session-revocation audit could not be recorded");
  }
}

export async function logoutAllAdminDevicesAction() {
  const owner = await requireOwner();
  await auth.api.revokeSessions({ headers: await headers() });
  try {
    await recordAdminAuditEvent({
      actorId: owner.userId,
      action: "security.all-sessions-revoked",
      entityType: "admin-account",
      entityId: owner.userId,
    });
  } catch {
    console.error("Session-revocation audit could not be recorded");
  }
  redirect("/admin/login?notice=sessions-revoked");
}
