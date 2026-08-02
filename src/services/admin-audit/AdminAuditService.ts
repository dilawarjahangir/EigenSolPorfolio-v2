import "server-only";

import type { PoolClient } from "pg";
import { insertAdminAuditEventRecord } from "@/repositories/AdminAuditRepository";

const auditNamePattern = /^[a-z0-9]+([._-][a-z0-9]+)*$/;
const forbiddenMetadataKeyPattern =
  /^(body|comment|content|credential|email|password|recovery_?codes?|secret|token)$/i;

export type AdminAuditMetadataValue =
  | string
  | number
  | boolean
  | null
  | readonly AdminAuditMetadataValue[]
  | Readonly<{ [key: string]: AdminAuditMetadataValue }>;

export type AdminAuditEventInput = Readonly<{
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Readonly<Record<string, AdminAuditMetadataValue>>;
}>;

function validateIdentifier(value: string | null | undefined, label: string) {
  if (
    value !== null &&
    value !== undefined &&
    !/^[A-Za-z0-9:_-]{1,200}$/.test(value)
  ) {
    throw new Error(`${label} is invalid.`);
  }
}

function validateMetadata(value: AdminAuditMetadataValue, key?: string): void {
  if (key && forbiddenMetadataKeyPattern.test(key)) {
    throw new Error(`Admin audit metadata cannot contain the key ${key}.`);
  }

  if (typeof value === "string" && value.length > 500) {
    throw new Error("Admin audit metadata strings must not exceed 500 characters.");
  }
  if (
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)
  ) {
    throw new Error("Admin audit metadata cannot contain an email address.");
  }

  if (Array.isArray(value)) {
    if (value.length > 50) throw new Error("Admin audit metadata arrays are too large.");
    for (const item of value) validateMetadata(item);
    return;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length > 50) throw new Error("Admin audit metadata objects are too large.");
    for (const [nestedKey, nestedValue] of entries) {
      validateMetadata(nestedValue, nestedKey);
    }
  }
}

export async function recordAdminAuditEvent(
  input: AdminAuditEventInput,
  transaction?: PoolClient,
) {
  if (!auditNamePattern.test(input.action) || input.action.length > 80) {
    throw new Error("Admin audit action is invalid.");
  }
  if (!auditNamePattern.test(input.entityType) || input.entityType.length > 80) {
    throw new Error("Admin audit entity type is invalid.");
  }

  validateIdentifier(input.actorId, "Admin audit actor id");
  validateIdentifier(input.entityId, "Admin audit entity id");

  const metadata = input.metadata ?? {};
  validateMetadata(metadata);

  await insertAdminAuditEventRecord(
    {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata,
    },
    transaction,
  );
}
