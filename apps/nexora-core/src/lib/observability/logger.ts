type LogLevel = "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|password|secret|token|credential|api[-_]?key/i;

const SENSITIVE_QUERY_KEY_PATTERN =
  /authorization|password|secret|token|credential|api[-_]?key|access[-_]?token|refresh[-_]?token/i;

const INLINE_SECRET_ASSIGNMENT_PATTERN =
  /\b(password|secret|token|credential|api[-_]?key|access[-_]?token|refresh[-_]?token)\b(\s*(?:=|:|is|was)\s*)(["']?)[^\s"'&,;]+/gi;

function sanitizeUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return value;
  }

  if (url.username) {
    url.username = "[REDACTED]";
  }

  if (url.password) {
    url.password = "[REDACTED]";
  }

  for (const key of [...url.searchParams.keys()]) {
    if (SENSITIVE_QUERY_KEY_PATTERN.test(key)) {
      url.searchParams.set(key, "[REDACTED]");
    }
  }

  return url.toString();
}

function sanitizeInlineSecrets(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\/\/([^:/@\s]+):([^@\s]+)@/g, "//[REDACTED]:[REDACTED]@")
    .replace(
      /([?&](?:access[_-]?token|refresh[_-]?token|token|secret|password|api[_-]?key)=)[^&#\s]*/gi,
      "$1[REDACTED]",
    )
    .replace(
      INLINE_SECRET_ASSIGNMENT_PATTERN,
      (_match, key: string, separator: string) =>
        `${key}${separator}[REDACTED]`,
    );
}

function sanitizeString(value: string): string {
  return sanitizeInlineSecrets(sanitizeUrl(value));
}

function sanitizeValue(value: unknown, seen: WeakSet<object>): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message),
      ...(process.env.NODE_ENV !== "production" && value.stack
        ? {
            stack: sanitizeString(value.stack),
          }
        : {}),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    const sanitized: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      sanitized[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? "[REDACTED]"
        : sanitizeValue(item, seen);
    }

    return sanitized;
  }

  return String(value);
}

function sanitizeContext(context: LogContext): LogContext {
  return sanitizeValue(context, new WeakSet<object>()) as LogContext;
}

function write(level: LogLevel, event: string, context: LogContext = {}): void {
  const entry = JSON.stringify({
    ...sanitizeContext(context),
    timestamp: new Date().toISOString(),
    level,
    event,
  });

  switch (level) {
    case "error":
      console.error(entry);
      return;

    case "warn":
      console.warn(entry);
      return;

    default:
      console.info(entry);
  }
}

export const logger = {
  info(event: string, context?: LogContext): void {
    write("info", event, context);
  },

  warn(event: string, context?: LogContext): void {
    write("warn", event, context);
  },

  error(event: string, context?: LogContext): void {
    write("error", event, context);
  },
};
