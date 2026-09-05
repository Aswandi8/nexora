import { prisma } from "@/database/prisma";

import { sanitizeAuditMetadata } from "./audit-sanitize";
import type { CreateAuditLogInput } from "./audit.types";

export async function createAuditLog(
  input: CreateAuditLogInput,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actor.userId,
      actorName: input.actor.name,
      actorEmail: input.actor.email,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      requestId: input.request.requestId,
      ipAddress: input.request.ipAddress,
      userAgent: input.request.userAgent,
      changedFields: [...new Set(input.changedFields ?? [])].sort(),
      metadata: sanitizeAuditMetadata(input.metadata),
    },
  });
}
