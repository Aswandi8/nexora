import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const coreVerificationRoute = new URL(
  "../src/app/api/account/email/verify/route.ts",
  import.meta.url,
);

const consoleVerificationPage = new URL(
  "../../nexora-console/src/app/verify-email-change/page.tsx",
  import.meta.url,
);

async function readSource(url: URL): Promise<string> {
  return readFile(url, "utf8");
}

test("Core email verification route exports POST", async () => {
  const source = await readSource(coreVerificationRoute);

  assert.match(source, /export\s+async\s+function\s+POST\s*\(/);
});

test("Core email verification route does not export GET", async () => {
  const source = await readSource(coreVerificationRoute);

  assert.doesNotMatch(source, /export\s+async\s+function\s+GET\s*\(/);
});

test("Console verification page submits verification through POST", async () => {
  const source = await readSource(consoleVerificationPage);

  assert.match(source, /method:\s*["']POST["']/);
});

test("Console verification page does not call Core verification with GET", async () => {
  const source = await readSource(consoleVerificationPage);

  assert.doesNotMatch(source, /method:\s*["']GET["']/);
});

test("Console verification requires an explicit form action", async () => {
  const source = await readSource(consoleVerificationPage);

  assert.match(source, /<form\s+action=\{verifyEmailChangeAction\}/);

  assert.match(source, /type=["']submit["']/);
});
