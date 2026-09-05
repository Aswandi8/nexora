const CORE_URL = normalizeBaseUrl(
  process.env.NEXORA_CORE_URL ?? "http://localhost:3000",
);
const CONSOLE_URL = normalizeBaseUrl(
  process.env.NEXORA_CONSOLE_URL ?? "http://localhost:3001",
);
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 10000);
const STARTUP_TIMEOUT_MS = Number(
  process.env.SMOKE_STARTUP_TIMEOUT_MS ?? 30000,
);
const STARTUP_POLL_MS = Number(process.env.SMOKE_STARTUP_POLL_MS ?? 1000);

const tests = [
  {
    name: "Core liveness",
    url: `${CORE_URL}/api/health/live`,
    expectedStatuses: [200],
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
    name: "Console login page",
    url: `${CONSOLE_URL}/login`,
    expectedStatuses: [200],
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
  try {
    const response = await fetchWithTimeout(test.url);
    const passed = test.expectedStatuses.includes(response.status);

    if (passed) {
      console.log(`PASS  ${test.name} -> HTTP ${response.status}`);
      continue;
    }

    failed++;
    console.error(
      `FAIL  ${test.name} -> HTTP ${response.status}, expected ${test.expectedStatuses.join(" or ")}`,
    );
  } catch (error) {
    failed++;
    console.error(`FAIL  ${test.name} -> ${formatError(error)}`);
  }
}

console.log("");

if (failed > 0) {
  console.error(`Smoke test failed: ${failed}/${tests.length} test(s) failed.`);
  process.exit(1);
}

console.log(
  `Smoke test passed: ${tests.length}/${tests.length} test(s) passed.`,
);

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
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
    } catch {}

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
