import { hashPassword } from "better-auth/crypto";
import {
  createAuthPool,
  loadLocalEnvironment,
  ownerEmail,
  promptForConfirmation,
  promptForNewPassword,
} from "./shared";
import { recordAdminAuditEvent } from "../../src/services/admin-audit/AdminAuditService";

async function main() {
  loadLocalEnvironment();

  await promptForConfirmation(
    "Type RESET PASSWORD to replace the owner password and revoke every owner session:",
    "RESET PASSWORD",
  );
  const password = await promptForNewPassword();
  const passwordHash = await hashPassword(password);
  const email = ownerEmail();
  const pool = createAuthPool("eigensol-admin-password-recovery");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('eigensol-admin-recovery'))");

    const owner = await client.query<{ id: string }>(
      'SELECT id FROM auth."user" WHERE email = $1 FOR UPDATE',
      [email],
    );
    if (owner.rowCount !== 1) throw new Error("The configured owner account was not found.");

    const ownerId = owner.rows[0].id;
    const account = await client.query(
      `
        UPDATE auth.account
        SET password = $2, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "userId" = $1 AND "providerId" = 'credential'
      `,
      [ownerId, passwordHash],
    );
    if (account.rowCount !== 1) {
      throw new Error("The owner credential account was not found; no changes were made.");
    }

    const sessions = await client.query(
      'DELETE FROM auth."session" WHERE "userId" = $1',
      [ownerId],
    );
    const verifications = await client.query("DELETE FROM auth.verification");
    await recordAdminAuditEvent(
      {
        actorId: ownerId,
        action: "auth.password-reset",
        entityType: "admin-owner",
        entityId: ownerId,
        metadata: {
          method: "operator-recovery",
          sessionsRevoked: sessions.rowCount ?? 0,
          verificationRecordsRevoked: verifications.rowCount ?? 0,
        },
      },
      client,
    );

    await client.query("COMMIT");
    console.info("The admin password was reset and all admin sessions were revoked.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Admin password recovery failed.");
  process.exitCode = 1;
});
