import { prisma } from "@/database";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

const DATABASE_READY_TIMEOUT_MS = 3_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("READINESS_TIMEOUT"));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export async function GET(): Promise<Response> {
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, DATABASE_READY_TIMEOUT_MS);

    return Response.json(
      {
        status: "ready",
        service: "nexora-core",
        database: "ready",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    logger.error("health.readiness.failed", {
      error,
    });

    return Response.json(
      {
        status: "not_ready",
        service: "nexora-core",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}
