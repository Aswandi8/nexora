import assert from "node:assert/strict";
import test from "node:test";

import {
  AuthAccountRejectedError,
  decideAuthContext,
} from "../../nexora-console/src/features/auth/auth-login-policy";

test("auth context HTTP 200 is ready", () => {
  const decision = decideAuthContext({
    status: 200,
  });

  assert.deepEqual(decision, {
    kind: "ready",
  });
});

test("auth context transient 401 is retried instead of rejecting login", () => {
  const decision = decideAuthContext({
    status: 401,
    code: "AUTH_REQUIRED",
    message: "Authentication required",
  });

  assert.deepEqual(decision, {
    kind: "retry",
  });
});

test("auth context rate limit is retried instead of rejecting login", () => {
  const decision = decideAuthContext({
    status: 429,
  });

  assert.deepEqual(decision, {
    kind: "retry",
  });
});

test("auth context server failures are retried instead of rejecting login", () => {
  const statuses = [500, 502, 503, 504];

  for (const status of statuses) {
    const decision = decideAuthContext({
      status,
    });

    assert.deepEqual(
      decision,
      {
        kind: "retry",
      },
      `HTTP ${status} should be retryable`,
    );
  }
});

test("inactive account is definitively rejected", () => {
  const decision = decideAuthContext({
    status: 403,
    code: "ACCOUNT_INACTIVE",
  });

  assert.equal(decision.kind, "reject");

  if (decision.kind !== "reject") {
    throw new Error("Expected inactive account rejection.");
  }

  assert.match(decision.message, /tidak aktif/i);
});

test("suspended account is definitively rejected", () => {
  const decision = decideAuthContext({
    status: 403,
    code: "ACCOUNT_SUSPENDED",
  });

  assert.equal(decision.kind, "reject");

  if (decision.kind !== "reject") {
    throw new Error("Expected suspended account rejection.");
  }

  assert.match(decision.message, /ditangguhkan/i);
});

test("forbidden account is definitively rejected", () => {
  const decision = decideAuthContext({
    status: 403,
  });

  assert.deepEqual(decision, {
    kind: "reject",
    message: "Akun Anda tidak memiliki akses ke Nexora Console.",
  });
});

test("unexpected non-definitive context response does not destroy successful login", () => {
  const statuses = [400, 404, 408];

  for (const status of statuses) {
    const decision = decideAuthContext({
      status,
    });

    assert.deepEqual(
      decision,
      {
        kind: "retry",
      },
      `HTTP ${status} must not be treated as definitive account rejection`,
    );
  }
});

test("account rejection error has a dedicated type", () => {
  const error = new AuthAccountRejectedError("Akun tidak memiliki akses.");

  assert.equal(error.name, "AuthAccountRejectedError");

  assert.equal(error.message, "Akun tidak memiliki akses.");

  assert.ok(error instanceof Error);
});
