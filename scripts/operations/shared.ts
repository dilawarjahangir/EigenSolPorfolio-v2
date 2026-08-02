import { loadEnvFile } from "node:process";
import { Pool, type PoolConfig } from "pg";

export function loadOperationsEnvironment() {
  try {
    loadEnvFile();
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }
}

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function sslConfiguration(): PoolConfig["ssl"] | undefined {
  const value = process.env.DATABASE_SSL?.trim().toLowerCase();

  if (!value) return undefined;
  if (value === "true" || value === "require" || value === "verify-full") {
    return { rejectUnauthorized: true };
  }
  if (value === "false" || value === "disable") return false;

  throw new Error("DATABASE_SSL must be true, false, require, verify-full, or disable.");
}

export function createOperationsPool(applicationName: string, maximumConnections = 2) {
  const ssl = sslConfiguration();

  return new Pool({
    connectionString: requiredEnvironmentVariable("DATABASE_URL"),
    application_name: applicationName,
    max: maximumConnections,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
    statement_timeout: 5 * 60_000,
    ...(ssl === undefined ? {} : { ssl }),
  });
}

export function operationalErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return "unknown";
  return String(error.code).slice(0, 80);
}
