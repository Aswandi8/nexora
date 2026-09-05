import type {
  AccountSessionList,
  LogoutAllSessionsResult,
  LogoutOtherSessionsResult,
  RevokeAccountSessionResult,
} from "@nexora/contracts";

import { accountSessionRepository } from "./account-session.repository";

function detectBrowser(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown browser";
  }

  if (/Edg\//i.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/OPR\//i.test(userAgent)) {
    return "Opera";
  }

  if (/Firefox\//i.test(userAgent)) {
    return "Firefox";
  }

  if (/Chrome\//i.test(userAgent)) {
    return "Google Chrome";
  }

  if (/Safari\//i.test(userAgent) && /Version\//i.test(userAgent)) {
    return "Safari";
  }

  return "Unknown browser";
}

function detectOperatingSystem(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown OS";
  }

  if (/Windows NT 10\.0/i.test(userAgent)) {
    return "Windows";
  }

  if (/Windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/Android/i.test(userAgent)) {
    return "Android";
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "iOS";
  }

  if (/Mac OS X|Macintosh/i.test(userAgent)) {
    return "macOS";
  }

  if (/Linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Unknown OS";
}

function detectDevice(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown device";
  }

  if (/iPad|Tablet/i.test(userAgent)) {
    return "Tablet";
  }

  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    return "Mobile";
  }

  return "Desktop";
}

function isLocalIpAddress(ipAddress: string): boolean {
  let normalized = ipAddress.trim().toLowerCase();

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    normalized = normalized.slice(1, -1);
  }

  const zoneIndex = normalized.indexOf("%");

  if (zoneIndex !== -1) {
    normalized = normalized.slice(0, zoneIndex);
  }

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::" ||
    normalized === "::1" ||
    normalized === "::ffff:127.0.0.1" ||
    normalized === "::ffff:7f00:1"
  ) {
    return true;
  }

  const parts = normalized.split(":");

  if (parts.length === 8) {
    const normalizedParts = parts.map(
      (part) => part.replace(/^0+/, "").toLowerCase() || "0",
    );

    const isUnspecified = normalizedParts.every((part) => part === "0");

    const isLoopback =
      normalizedParts.slice(0, 7).every((part) => part === "0") &&
      normalizedParts[7] === "1";

    if (isUnspecified || isLoopback) {
      return true;
    }
  }

  return false;
}

function formatIpAddress(ipAddress: string | null): string | null {
  if (!ipAddress) {
    return null;
  }

  const value = ipAddress.trim();

  if (!value) {
    return null;
  }

  if (isLocalIpAddress(value)) {
    return "Localhost";
  }

  return value;
}

export async function listOwnSessions(
  userId: string,
  currentSessionId: string,
): Promise<AccountSessionList> {
  const sessions = await accountSessionRepository.listActive(userId);

  return {
    sessions: sessions.map((session) => ({
      id: session.id,
      current: session.id === currentSessionId,
      device: detectDevice(session.userAgent),
      browser: detectBrowser(session.userAgent),
      operatingSystem: detectOperatingSystem(session.userAgent),
      ipAddress: formatIpAddress(session.ipAddress),
      createdAt: session.createdAt.toISOString(),
      lastActiveAt: session.updatedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    })),
  };
}

export async function revokeOwnSession(
  userId: string,
  currentSessionId: string,
  sessionId: string,
): Promise<RevokeAccountSessionResult> {
  const result = await accountSessionRepository.revokeOne(
    userId,
    currentSessionId,
    sessionId,
  );

  return {
    revoked: result.count > 0,
  };
}

export async function logoutOwnOtherSessions(
  userId: string,
  currentSessionId: string,
): Promise<LogoutOtherSessionsResult> {
  const result = await accountSessionRepository.revokeOther(
    userId,
    currentSessionId,
  );

  return {
    revokedCount: result.count,
  };
}

export async function logoutOwnAllSessions(
  userId: string,
): Promise<LogoutAllSessionsResult> {
  const result = await accountSessionRepository.revokeAll(userId);

  return {
    revokedCount: result.count,
  };
}
