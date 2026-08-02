import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import {
  createAuthPool,
  loadLocalEnvironment,
  ownerEmail,
  promptForNewPassword,
  requiredEnvironmentVariable,
} from "./shared";
import { recordAdminAuditEvent } from "../../src/services/admin-audit/AdminAuditService";

async function main() {
  loadLocalEnvironment();

  const email = ownerEmail();
  const secret = requiredEnvironmentVariable("BETTER_AUTH_SECRET");
  const name = process.env.ADMIN_NAME?.trim() || "EigenSol Owner";

  if (secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
  }
  if (name.length > 120) throw new Error("ADMIN_NAME must not exceed 120 characters.");

  const pool = createAuthPool("eigensol-admin-bootstrap");

  try {
    const migration = await pool.query<{ applied: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM auth.schema_migrations WHERE version = '006_auth_uuid_defaults'
       ) AS applied`,
    );
    if (!migration.rows[0]?.applied) {
      throw new Error("Apply all committed auth migrations before bootstrapping the owner.");
    }

    const auditMigration = await pool.query<{ applied: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM content.schema_migrations WHERE version = '005_admin_audit'
       ) AS applied`,
    );
    if (!auditMigration.rows[0]?.applied) {
      throw new Error("Apply database/migrations/005_admin_audit.sql before bootstrapping the owner.");
    }

    const users = await pool.query<{ email: string }>('SELECT email FROM auth."user" LIMIT 2');
    if (users.rowCount) {
      if (users.rowCount === 1 && users.rows[0].email.toLowerCase() === email) {
        throw new Error("The configured owner account already exists; no changes were made.");
      }
      throw new Error("The auth schema already contains a different account; no changes were made.");
    }

    const password = await promptForNewPassword();
    const bootstrapAuth = betterAuth({
      appName: "EigenSol Admin",
      baseURL: "https://eigensol.com",
      secret,
      trustedOrigins: ["https://eigensol.com"],
      database: pool,
      advanced: { database: { generateId: "uuid" } },
      emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        autoSignIn: false,
        minPasswordLength: 12,
        maxPasswordLength: 128,
      },
      databaseHooks: {
        user: {
          create: {
            async before(user) {
              if (user.email.trim().toLowerCase() !== email) return false;
              return { data: { ...user, email } };
            },
          },
        },
      },
      plugins: [twoFactor({ issuer: "EigenSol Admin" })],
      telemetry: { enabled: false },
    });

    const result = await bootstrapAuth.api.signUpEmail({ body: { email, password, name } });
    if (result.user.email.toLowerCase() !== email) {
      throw new Error("Owner bootstrap returned an unexpected identity.");
    }

    const auditClient = await pool.connect();
    try {
      await recordAdminAuditEvent(
        {
          actorId: result.user.id,
          action: "auth.owner-bootstrapped",
          entityType: "admin-owner",
          entityId: result.user.id,
          metadata: { method: "operator-bootstrap" },
        },
        auditClient,
      );
    } finally {
      auditClient.release();
    }

    console.info("EigenSol owner account created. Sign in and complete mandatory TOTP setup.");
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Owner bootstrap failed.");
  process.exitCode = 1;
});
