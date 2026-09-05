import { randomUUID } from "node:crypto";

import type { AuthenticatedAdmin } from "@/auth";
import { logger } from "@/lib/observability/logger";

import { createAuditLog } from "./audit.repository";
import type { AuditAction, AuditResource } from "./audit.types";

type WriteAuditLogInput = {
  request: Request;
  actor: AuthenticatedAdmin;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  changedFields?: string[];
  metadata?: Record<string, unknown>;
};

function getRequestId(headers: Headers): string {
  const requestId = headers.get("x-request-id")?.trim();

  return requestId ? requestId.slice(0, 128) : randomUUID();
}

function getIpAddress(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  const realIp = headers.get("x-real-ip")?.trim();

  return (forwardedFor || realIp || null)?.slice(0, 128) ?? null;
}

function getUserAgent(headers: Headers): string | null {
  return headers.get("user-agent")?.trim().slice(0, 512) || null;
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  const requestId = getRequestId(input.request.headers);

  try {
    await createAuditLog({
      actor: {
        userId: input.actor.user.id,
        name: input.actor.user.name,
        email: input.actor.user.email,
      },
      request: {
        requestId,
        ipAddress: getIpAddress(input.request.headers),
        userAgent: getUserAgent(input.request.headers),
      },
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      changedFields: input.changedFields,
      metadata: input.metadata,
    });

    logger.info("audit.recorded", {
      requestId,
      actorUserId: input.actor.user.id,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
    });
  } catch (error) {
    logger.error("audit.write-failed", {
      requestId,
      actorUserId: input.actor.user.id,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      error,
    });
  }
}
