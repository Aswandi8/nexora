type LogLevel = "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN =
  /authorization|cookie|password|secret|token|credential|api[-_]?key/i;

function sanitizeString(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\/\/([^:/@\s]+):([^@\s]+)@/g, "//[REDACTED]:[REDACTED]@");
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
