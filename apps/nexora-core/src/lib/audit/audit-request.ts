import type { AuditRequestContext } from "./audit.types";

const MAX_USER_AGENT_LENGTH = 512;
const MAX_IP_LENGTH = 128;

function normalizeHeader(
  value: string | null,
  maxLength: number,
): string | null {
  const normalized = value?.trim();

  if (!normalized) return null;

  return normalized.slice(0, maxLength);
}

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();

    if (first) {
      return normalizeHeader(first, MAX_IP_LENGTH);
    }
  }

  return normalizeHeader(request.headers.get("x-real-ip"), MAX_IP_LENGTH);
}

export function getAuditRequestContext(request: Request): AuditRequestContext {
  return {
    requestId:
      request.headers.get("x-request-id")?.trim().slice(0, 128) ||
      crypto.randomUUID(),

    ipAddress: getClientIp(request),

    userAgent: normalizeHeader(
      request.headers.get("user-agent"),
      MAX_USER_AGENT_LENGTH,
    ),
  };
}
