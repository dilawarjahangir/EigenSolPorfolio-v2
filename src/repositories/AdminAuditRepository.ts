import "server-only";

import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { getPostgresPool } from "@/database/PostgresDatabase";

export type AdminAuditRecordInput = Readonly<{
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Readonly<Record<string, unknown>>;
}>;

export async function insertAdminAuditEventRecord(
  input: AdminAuditRecordInput,
  transaction?: PoolClient,
) {
  const database = transaction ?? getPostgresPool();

  await database.query(
    `
      INSERT INTO content.admin_audit_events (
        id,
        actor_id,
        action,
        entity_type,
        entity_id,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    `,
    [
      randomUUID(),
      input.actorId,
      input.action,
      input.entityType,
      input.entityId,
      JSON.stringify(input.metadata),
    ],
  );
}
