import "server-only";

const productionOrigin = "https://eigensol.com";

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) throw new Error(`Missing authentication configuration: ${name}`);

  return value;
}

function validOrigin(value: string, name: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid authentication configuration: ${name}`);
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`Invalid authentication configuration: ${name}`);
  }

  return url.origin;
}

export function getAdminEmail() {
  const configuredEmail =
    process.env.ADMIN_EMAIL?.trim() || process.env.CONTACT_TO_EMAIL?.trim();
  if (!configuredEmail) {
    throw new Error(
      "Missing authentication configuration: ADMIN_EMAIL or CONTACT_TO_EMAIL",
    );
  }
  const email = configuredEmail.toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid authentication configuration: ADMIN_EMAIL");
  }

  return email;
}

export function isAdminEmail(value: string) {
  return value.trim().toLowerCase() === getAdminEmail();
}

export function getBetterAuthSecret() {
  const secret = requiredEnvironmentVariable("BETTER_AUTH_SECRET");

  if (secret.length < 32) {
    throw new Error("Invalid authentication configuration: BETTER_AUTH_SECRET");
  }

  return secret;
}

export function getBetterAuthOrigin() {
  const configuredOrigin = process.env.BETTER_AUTH_URL?.trim();

  if (configuredOrigin) return validOrigin(configuredOrigin, "BETTER_AUTH_URL");

  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : productionOrigin;
}

export function getBetterAuthTrustedOrigins() {
  return Array.from(new Set([getBetterAuthOrigin(), productionOrigin]));
}
