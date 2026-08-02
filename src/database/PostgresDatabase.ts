import "server-only";

import { Pool, type PoolConfig } from "pg";

type PostgresGlobal = typeof globalThis & {
  eigensolPostgresPool?: Pool;
  eigensolAuthPostgresPool?: Pool;
};

const postgresGlobal = globalThis as PostgresGlobal;

function databaseConnectionString() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error("Missing database configuration: DATABASE_URL");
  }

  return connectionString;
}

function databaseSslConfiguration(): PoolConfig["ssl"] | undefined {
  const value = process.env.DATABASE_SSL?.trim().toLowerCase();

  if (!value) return undefined;
  if (value === "true" || value === "require" || value === "verify-full") {
    return { rejectUnauthorized: true };
  }
  if (value === "false" || value === "disable") return false;

  throw new Error("Invalid database configuration: DATABASE_SSL");
}

type PostgresPoolOptions = {
  applicationName: string;
  maxConnections: number;
  searchPath?: string;
};

function createPostgresPool({
  applicationName,
  maxConnections,
  searchPath,
}: PostgresPoolOptions) {
  const ssl = databaseSslConfiguration();
  const configuration: PoolConfig = {
    connectionString: databaseConnectionString(),
    application_name: applicationName,
    max: maxConnections,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    statement_timeout: 5_000,
    ...(searchPath ? { options: `-c search_path=${searchPath}` } : {}),
    ...(ssl === undefined ? {} : { ssl }),
  };
  const pool = new Pool(configuration);

  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error", {
      code: databaseErrorCode(error),
    });
  });

  return pool;
}

export function databaseErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return "unknown";
  return String(error.code).slice(0, 80);
}

export function getPostgresPool() {
  if (!postgresGlobal.eigensolPostgresPool) {
    postgresGlobal.eigensolPostgresPool = createPostgresPool({
      applicationName: "eigensol-website",
      maxConnections: 5,
    });
  }

  return postgresGlobal.eigensolPostgresPool;
}

export function getAuthPostgresPool() {
  if (!postgresGlobal.eigensolAuthPostgresPool) {
    postgresGlobal.eigensolAuthPostgresPool = createPostgresPool({
      applicationName: "eigensol-admin-auth",
      maxConnections: 3,
      searchPath: "auth,public",
    });
  }

  return postgresGlobal.eigensolAuthPostgresPool;
}
