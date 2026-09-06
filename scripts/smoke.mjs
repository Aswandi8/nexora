const CORE_URL = normalizeBaseUrl(
  process.env.NEXORA_CORE_URL ?? "http://localhost:3000",
);

const CONSOLE_URL = normalizeBaseUrl(
  process.env.NEXORA_CONSOLE_URL ?? "http://localhost:3001",
);

const REQUEST_TIMEOUT_MS = parsePositiveInteger(
  process.env.SMOKE_TIMEOUT_MS,
  10000,
);

const STARTUP_TIMEOUT_MS = parsePositiveInteger(
  process.env.SMOKE_STARTUP_TIMEOUT_MS,
  30000,
);

const STARTUP_POLL_MS = parsePositiveInteger(
  process.env.SMOKE_STARTUP_POLL_MS,
  1000,
);

const tests = [
  {
    name: "Core liveness",
    url: `${CORE_URL}/api/health/live`,
    expectedStatuses: [200],
    expectedHeaders: {
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
  },
  {
    name: "Core readiness",
    url: `${CORE_URL}/api/health/ready`,
    expectedStatuses: [200],
  },
  {
    name: "Core auth context rejects anonymous request",
    url: `${CORE_URL}/api/auth/context`,
    expectedStatuses: [401],
  },
  {
    name: "Core permissions rejects anonymous request",
    url: `${CORE_URL}/api/permissions`,
    expectedStatuses: [401, 403],
  },
  {
    name: "Email verification cannot mutate through GET",
    url: `${CORE_URL}/api/account/email/verify?token=smoke-test`,
    expectedStatuses: [405],
  },
  {
    name: "Console login page",
    url: `${CONSOLE_URL}/login`,
    expectedStatuses: [200],
    expectedHeaders: {
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
  },
];

let failed = 0;

console.log("Nexora smoke tests");
console.log(`Core    : ${CORE_URL}`);
console.log(`Console : ${CONSOLE_URL}`);
console.log("");

try {
  await waitForServer(`${CORE_URL}/api/health/live`, "Core");
  await waitForServer(`${CONSOLE_URL}/login`, "Console");
} catch (error) {
  console.error(`STARTUP FAIL -> ${formatError(error)}`);
  process.exit(1);
}

for (const test of tests) {
  await runTest(test);
}

console.log("");

if (failed > 0) {
  console.error(`Smoke test failed: ${failed}/${tests.length} test(s) failed.`);
  process.exit(1);
}

console.log(
  `Smoke test passed: ${tests.length}/${tests.length} test(s) passed.`,
);

async function runTest(test) {
  try {
    const response = await fetchWithTimeout(test.url);
    const problems = [];

    if (!test.expectedStatuses.includes(response.status)) {
      problems.push(
        `HTTP ${response.status}, expected ${test.expectedStatuses.join(" or ")}`,
      );
    }

    for (const [headerName, expectedValue] of Object.entries(
      test.expectedHeaders ?? {},
    )) {
      const actualValue = response.headers.get(headerName);

      if (actualValue !== expectedValue) {
        problems.push(
          `${headerName}=${JSON.stringify(actualValue)}, expected ${JSON.stringify(expectedValue)}`,
        );
      }
    }

    if (problems.length === 0) {
      console.log(`PASS  ${test.name} -> HTTP ${response.status}`);
      return;
    }

    failed++;
    console.error(`FAIL  ${test.name} -> ${problems.join("; ")}`);
  } catch (error) {
    failed++;
    console.error(`FAIL  ${test.name} -> ${formatError(error)}`);
  }
}

async function waitForServer(url, name) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetchWithTimeout(url);

      if (response.status < 500) {
        console.log(`READY ${name} -> HTTP ${response.status}`);
        return;
      }
    } catch {
      // Server may still be starting.
    }

    await delay(STARTUP_POLL_MS);
  }

  throw new Error(
    `${name} did not become ready within ${STARTUP_TIMEOUT_MS}ms`,
  );
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        accept: "application/json,text/html;q=0.9,*/*;q=0.8",
        "user-agent": "nexora-smoke-test",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  return url.toString().replace(/\/+$/, "");
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Expected positive integer but received ${JSON.stringify(value)}`,
    );
  }

  return parsed;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(error) {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return `request timed out after ${REQUEST_TIMEOUT_MS}ms`;
    }

    return error.message;
  }

  return String(error);
}
