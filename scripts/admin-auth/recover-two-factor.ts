import {
  createAuthPool,
  loadLocalEnvironment,
  ownerEmail,
  promptForConfirmation,
} from "./shared";
import { recordAdminAuditEvent } from "../../src/services/admin-audit/AdminAuditService";

async function main() {
  loadLocalEnvironment();

  await promptForConfirmation(
    "Type RESET TOTP to revoke every owner session and remove the enrolled authenticator:",
    "RESET TOTP",
  );

  const email = ownerEmail();
  const pool = createAuthPool("eigensol-admin-recovery");
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
    const sessions = await client.query(
      'DELETE FROM auth."session" WHERE "userId" = $1',
      [ownerId],
    );
    const factors = await client.query(
      'DELETE FROM auth."twoFactor" WHERE "userId" = $1',
      [ownerId],
    );
    const verifications = await client.query("DELETE FROM auth.verification");
    await client.query(
      `UPDATE auth."user"
          SET "twoFactorEnabled" = FALSE,
              "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $1`,
      [ownerId],
    );

    await recordAdminAuditEvent(
      {
        actorId: ownerId,
        action: "auth.two-factor-reset",
        entityType: "admin-owner",
        entityId: ownerId,
        metadata: {
          method: "operator-recovery",
          sessionsRevoked: sessions.rowCount ?? 0,
          factorRecordsRemoved: factors.rowCount ?? 0,
          verificationRecordsRevoked: verifications.rowCount ?? 0,
        },
      },
      client,
    );

    await client.query("COMMIT");
    console.info("Two-factor state and all admin sessions were reset. Enroll TOTP after signing in.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Two-factor recovery failed.");
  process.exitCode = 1;
});
