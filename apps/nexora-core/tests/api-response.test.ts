import assert from "node:assert/strict";
import test from "node:test";

import { API_ERROR_CODES } from "@nexora/contracts";

import { Prisma } from "@/generated/prisma/client";
import { apiError } from "@/lib/api/api-response";

type ErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

function createKnownPrismaError(
  code: string,
  meta?: Record<string, unknown>,
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(`Prisma test error ${code}`, {
    code,
    clientVersion: "7.10.0",
    meta,
  });
}

async function readErrorBody(response: Response): Promise<ErrorBody> {
  return (await response.json()) as ErrorBody;
}

function captureErrorLog<T>(callback: () => T): {
  result: T;
  output: string;
} {
  const originalConsoleError = console.error;

  let output = "";

  console.error = (...args: unknown[]) => {
    output += args.map(String).join(" ");
  };

  try {
    return {
      result: callback(),
      output,
    };
  } finally {
    console.error = originalConsoleError;
  }
}

test("maps Prisma P2002 unique conflict to HTTP 409", async () => {
  const response = apiError(
    createKnownPrismaError("P2002", {
      target: ["slug"],
    }),
  );

  const body = await readErrorBody(response);

  assert.equal(response.status, 409);

  assert.equal(response.headers.get("cache-control"), "no-store");

  assert.equal(body.success, false);

  assert.equal(body.error.code, API_ERROR_CODES.CONFLICT);
});

test("maps Prisma P2025 missing record to HTTP 404", async () => {
  const response = apiError(createKnownPrismaError("P2025"));

  const body = await readErrorBody(response);

  assert.equal(response.status, 404);

  assert.equal(body.error.code, API_ERROR_CODES.NOT_FOUND);
});

test("maps unknown Prisma request errors to database error 500", async () => {
  const { result: response } = captureErrorLog(() =>
    apiError(createKnownPrismaError("P2024")),
  );

  const body = await readErrorBody(response);

  assert.equal(response.status, 500);

  assert.equal(body.error.code, API_ERROR_CODES.DATABASE_ERROR);
});

test("maps Zod validation errors to HTTP 422 with fields", async () => {
  const { z } = await import("zod");

  const schema = z.object({
    slug: z.string().min(3),
  });

  const result = schema.safeParse({
    slug: "",
  });

  assert.equal(result.success, false);

  if (result.success) {
    throw new Error("Expected schema validation to fail");
  }

  const response = apiError(result.error);
  const body = await readErrorBody(response);

  assert.equal(response.status, 422);

  assert.equal(body.error.code, API_ERROR_CODES.VALIDATION_ERROR);

  assert.ok(body.error.fields?.slug);

  assert.ok(body.error.fields.slug.length > 0);
});

test("maps authentication errors to HTTP 401", async () => {
  const response = apiError(new Error("AUTH_REQUIRED"));

  const body = await readErrorBody(response);

  assert.equal(response.status, 401);

  assert.equal(body.error.code, API_ERROR_CODES.AUTH_REQUIRED);
});

test("maps permission errors to HTTP 403", async () => {
  const response = apiError(new Error("FORBIDDEN"));

  const body = await readErrorBody(response);

  assert.equal(response.status, 403);

  assert.equal(body.error.code, API_ERROR_CODES.FORBIDDEN);
});

test("unknown application errors hide secrets from both response and logs", async () => {
  const secret = "postgres-secret-password";

  const { result: response, output } = captureErrorLog(() =>
    apiError(new Error(`database password is ${secret}`)),
  );

  const body = await readErrorBody(response);

  assert.equal(response.status, 500);

  assert.equal(body.error.code, API_ERROR_CODES.INTERNAL_ERROR);

  assert.doesNotMatch(body.error.message, new RegExp(secret));

  assert.doesNotMatch(output, new RegExp(secret));

  assert.match(output, /\[REDACTED\]/);
});
