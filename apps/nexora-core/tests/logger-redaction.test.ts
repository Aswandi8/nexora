import assert from "node:assert/strict";
import test from "node:test";

import { logger } from "@/lib/observability/logger";

function captureErrorLog(callback: () => void): string {
  const originalConsoleError = console.error;

  let output = "";

  console.error = (...args: unknown[]) => {
    output += args.map(String).join(" ");
  };

  try {
    callback();
  } finally {
    console.error = originalConsoleError;
  }

  return output;
}

test("redacts sensitive structured keys", () => {
  const output = captureErrorLog(() => {
    logger.error("security_test", {
      username: "aswandi",
      password: "password-secret-value",
      accessToken: "access-token-secret-value",
      refresh_token: "refresh-token-secret-value",
      api_key: "api-key-secret-value",
      nested: {
        clientSecret: "client-secret-value",
      },
    });
  });

  assert.doesNotMatch(output, /password-secret-value/);
  assert.doesNotMatch(output, /access-token-secret-value/);
  assert.doesNotMatch(output, /refresh-token-secret-value/);
  assert.doesNotMatch(output, /api-key-secret-value/);
  assert.doesNotMatch(output, /client-secret-value/);
  assert.match(output, /\[REDACTED\]/);
});

test("redacts Bearer tokens embedded in strings", () => {
  const secret = "eyJhbGciOiJIUzI1NiJ9.super-secret.signature";

  const output = captureErrorLog(() => {
    logger.error("bearer_test", {
      message: `Authorization failed: Bearer ${secret}`,
    });
  });

  assert.doesNotMatch(output, new RegExp(secret));
  assert.match(output, /Bearer \[REDACTED\]/);
});

test("redacts credentials embedded in URLs", () => {
  const output = captureErrorLog(() => {
    logger.error("url_credentials_test", {
      url: "https://admin:super-password@example.com/private",
    });
  });

  assert.doesNotMatch(output, /super-password/);
  assert.doesNotMatch(output, /admin:super-password/);
  assert.match(output, /\[REDACTED\]/);
});

test("redacts token query parameters in URLs", () => {
  const accessToken = "access-token-123456";
  const refreshToken = "refresh-token-987654";

  const output = captureErrorLog(() => {
    logger.error("url_token_test", {
      callbackUrl:
        `https://example.com/callback?access_token=${accessToken}` +
        `&refresh_token=${refreshToken}&state=public-state`,
    });
  });

  assert.doesNotMatch(output, new RegExp(accessToken));

  assert.doesNotMatch(output, new RegExp(refreshToken));

  assert.match(output, /public-state/);
});

test("redacts token-like query strings embedded in arbitrary text", () => {
  const token = "secret-query-token";

  const output = captureErrorLog(() => {
    logger.error("inline_query_test", {
      message: `Request failed at /callback?token=${token}&next=/dashboard`,
    });
  });

  assert.doesNotMatch(output, new RegExp(token));
  assert.match(output, /next=\/dashboard/);
});

test("redacts password expressed as natural error text", () => {
  const secret = "postgres-secret-password";

  const output = captureErrorLog(() => {
    logger.error("database_failure", {
      error: new Error(`database password is ${secret}`),
    });
  });

  assert.doesNotMatch(output, new RegExp(secret));

  assert.match(output, /password is \[REDACTED\]/i);
});

test("redacts secret assignment expressions", () => {
  const output = captureErrorLog(() => {
    logger.error("assignment_test", {
      messages: [
        "password=very-secret-password",
        "secret: very-secret-secret",
        "token is very-secret-token",
        "api_key was very-secret-key",
      ],
    });
  });

  assert.doesNotMatch(output, /very-secret-password/);

  assert.doesNotMatch(output, /very-secret-secret/);

  assert.doesNotMatch(output, /very-secret-token/);

  assert.doesNotMatch(output, /very-secret-key/);
});

test("handles circular objects safely", () => {
  const circular: Record<string, unknown> = {
    name: "safe-value",
  };

  circular.self = circular;

  const output = captureErrorLog(() => {
    logger.error("circular_test", {
      circular,
    });
  });

  assert.match(output, /\[Circular\]/);
  assert.match(output, /safe-value/);
});
