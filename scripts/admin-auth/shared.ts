import { loadEnvFile } from "node:process";
import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";
import { Pool, type PoolConfig } from "pg";

export function loadLocalEnvironment() {
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

export function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) throw new Error(`Missing required environment variable: ${name}`);

  return value;
}

export function ownerEmail() {
  const configuredEmail =
    process.env.ADMIN_EMAIL?.trim() || process.env.CONTACT_TO_EMAIL?.trim();
  if (!configuredEmail) {
    throw new Error("ADMIN_EMAIL or CONTACT_TO_EMAIL must be configured.");
  }
  const email = configuredEmail.toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }

  return email;
}

export async function promptForConfirmation(prompt: string, expected: string) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("This recovery command requires an interactive terminal.");
  }

  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await terminal.question(`${prompt}\n> `);
    if (answer !== expected) throw new Error("Confirmation did not match; no changes were made.");
  } finally {
    terminal.close();
  }
}

export async function promptForHiddenPassword(prompt: string) {
  if (!process.stdin.isTTY || !process.stdout.isTTY || !process.stdin.setRawMode) {
    throw new Error("Password entry requires an interactive terminal.");
  }

  process.stdout.write(prompt);
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise<string>((resolve, reject) => {
    let password = "";

    const finish = (error?: Error) => {
      process.stdin.off("keypress", handleKeypress);
      process.stdin.setRawMode?.(false);
      process.stdin.pause();
      process.stdout.write("\n");

      if (error) reject(error);
      else resolve(password);
    };

    const handleKeypress = (
      character: string | undefined,
      key: Readonly<{ name?: string; ctrl?: boolean; meta?: boolean }>,
    ) => {
      if (key.ctrl && key.name === "c") {
        finish(new Error("Password entry was cancelled."));
        return;
      }
      if (key.name === "return" || key.name === "enter") {
        finish();
        return;
      }
      if (key.name === "backspace") {
        password = password.slice(0, -1);
        return;
      }
      if (!key.ctrl && !key.meta && character && !/[\u0000-\u001f\u007f]/.test(character)) {
        password += character;
      }
    };

    process.stdin.on("keypress", handleKeypress);
  });
}

export async function promptForNewPassword() {
  const password = await promptForHiddenPassword("New admin password: ");
  const confirmation = await promptForHiddenPassword("Confirm admin password: ");

  if (password !== confirmation) throw new Error("The passwords did not match.");
  if (password.length < 12 || password.length > 128) {
    throw new Error("The password must contain between 12 and 128 characters.");
  }

  return password;
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

export function createAuthPool(applicationName: string) {
  const ssl = sslConfiguration();

  return new Pool({
    connectionString: requiredEnvironmentVariable("DATABASE_URL"),
    application_name: applicationName,
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
    statement_timeout: 10_000,
    options: "-c search_path=auth,public",
    ...(ssl === undefined ? {} : { ssl }),
  });
}
