import type { Prisma } from "@/generated/prisma/client";

const SENSITIVE_KEY_PATTERN =
  /password|secret|token|cookie|authorization|credential|api[-_]?key/i;

const MAX_METADATA_DEPTH = 4;
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_LENGTH = 50;

type SanitizedJsonValue = Prisma.InputJsonValue | null;

function sanitizeValue(value: unknown, depth: number): SanitizedJsonValue {
  if (depth > MAX_METADATA_DEPTH) return "[TRUNCATED]";
  if (value === null) return null;

  if (typeof value === "string") {
    return value.slice(0, MAX_STRING_LENGTH);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const result: Array<Prisma.InputJsonValue | null> = [];

    for (const item of value.slice(0, MAX_ARRAY_LENGTH)) {
      if (item === undefined) continue;
      result.push(sanitizeValue(item, depth + 1));
    }

    return result;
  }

  if (typeof value === "object") {
    const entries: Array<[string, Prisma.InputJsonValue | null]> = [];

    for (const [key, item] of Object.entries(value)) {
      if (item === undefined) continue;

      entries.push([
        key,
        SENSITIVE_KEY_PATTERN.test(key)
          ? "[REDACTED]"
          : sanitizeValue(item, depth + 1),
      ]);
    }

    return Object.fromEntries(entries);
  }

  return String(value).slice(0, MAX_STRING_LENGTH);
}

export function sanitizeAuditMetadata(
  metadata: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  if (!metadata) return undefined;

  const sanitized = sanitizeValue(metadata, 0);

  return sanitized === null ? {} : sanitized;
}
