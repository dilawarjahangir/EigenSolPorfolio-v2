import "server-only";

import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { getAuthPostgresPool } from "@/database/PostgresDatabase";
import {
  getAdminEmail,
  getBetterAuthOrigin,
  getBetterAuthSecret,
  getBetterAuthTrustedOrigins,
  isAdminEmail,
} from "@/lib/auth-environment";
import { sendAdminPasswordResetEmail } from "@/lib/form-mail";

const authPool = getAuthPostgresPool();

export const auth = betterAuth({
  appName: "EigenSol Admin",
  baseURL: getBetterAuthOrigin(),
  secret: getBetterAuthSecret(),
  trustedOrigins: getBetterAuthTrustedOrigins(),
  database: authPool,
  advanced: {
    database: { generateId: "uuid" },
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "eigensol_admin",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 30 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      if (!isAdminEmail(user.email)) return;

      await sendAdminPasswordResetEmail({
        email: getAdminEmail(),
        resetUrl: url,
      });
    },
  },
  session: {
    expiresIn: 12 * 60 * 60,
    disableSessionRefresh: true,
    freshAge: 15 * 60,
  },
  verification: {
    storeIdentifier: {
      default: "plain",
      overrides: { "reset-password:": "hashed" },
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 5 * 60, max: 3 },
      "/reset-password": { window: 5 * 60, max: 5 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          if (!isAdminEmail(user.email)) return false;

          return { data: { ...user, email: getAdminEmail() } };
        },
      },
      update: {
        async before(user) {
          if (typeof user.email === "string" && !isAdminEmail(user.email)) return false;
        },
      },
    },
    session: {
      create: {
        async before(session) {
          const owner = await authPool.query<{ email: string }>(
            'SELECT email FROM auth."user" WHERE id = $1 LIMIT 1',
            [session.userId],
          );

          if (owner.rowCount !== 1 || !isAdminEmail(owner.rows[0].email)) return false;
        },
      },
    },
  },
  plugins: [
    twoFactor({
      issuer: "EigenSol Admin",
      skipVerificationOnEnable: false,
      twoFactorCookieMaxAge: 10 * 60,
      trustDeviceMaxAge: 0,
      backupCodeOptions: {
        amount: 10,
        length: 12,
        storeBackupCodes: "encrypted",
      },
      accountLockout: {
        enabled: true,
        maxFailedAttempts: 5,
        durationSeconds: 15 * 60,
      },
    }),
  ],
  telemetry: { enabled: false },
});
