import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredFiles = [
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "README.md",
  "docs/PRODUCTION.md",
  "apps/nexora-core/.env.example",
  "apps/nexora-console/.env.example",
  "apps/nexora-core/prisma/schema.prisma",
  "apps/nexora-core/prisma7.config.ts",
  "apps/nexora-core/src/app/watch/[slug]/route.ts",
  "apps/nexora-core/src/app/watch/[slug]/poster/route.ts",
  "apps/nexora-core/src/app/api/account/email/verify/route.ts",
  "apps/nexora-core/src/app/api/shortlinks/route.ts",
  "apps/nexora-core/src/app/api/shortlinks/[id]/route.ts",
  "apps/nexora-core/next.config.ts",
  "apps/nexora-console/next.config.ts",
  ".github/workflows/ci.yml",
];

const requiredScripts = [
  "build",
  "build:core",
  "build:console",
  "typecheck:core",
  "typecheck:console",
  "lint:core",
  "lint:console",
  "check",
  "test:smoke",
  "audit:readiness",
  "db:generate",
  "db:migrate:status",
  "db:migrate:deploy",
  "db:seed",
  "release:verify",
];

const forbiddenPaths = [
  "apps/nexora-core/src/lib/audit/audit-request.ts",
  "db-dump.cjs",
  "explore.sh",
  "packages/config",
  "packages/utils",
];

let failed = 0;

console.log("Nexora production readiness");
console.log("---------------------------");

await checkRequiredFiles();
await checkPackageScripts();
await checkForbiddenPaths();
await checkEnvironmentContracts();
await checkPosterSecurity();
await checkEmailVerificationSecurity();
await checkPublicOriginSecurity();
await checkShortlinkCacheInvalidation();
await checkSecurityHeaders();
await checkProductionDocumentation();

console.log("---------------------------");

if (failed > 0) {
  console.error(`Readiness failed: ${failed} issue(s) found.`);
  process.exit(1);
}

console.log("Production readiness guards passed.");

async function checkRequiredFiles() {
  for (const file of requiredFiles) {
    if (await exists(file)) {
      pass(`required file -> ${file}`);
    } else {
      fail(`Missing required file -> ${file}`);
    }
  }
}

async function checkPackageScripts() {
  const packageJson = await readJson("package.json");

  if (!packageJson) {
    return;
  }

  for (const script of requiredScripts) {
    if (
      typeof packageJson.scripts?.[script] === "string" &&
      packageJson.scripts[script].trim()
    ) {
      pass(`package script -> ${script}`);
    } else {
      fail(`Missing package script -> ${script}`);
    }
  }

  if (packageJson.packageManager === "pnpm@11.24.0") {
    pass("package manager locked -> pnpm@11.24.0");
  } else {
    fail("packageManager must remain locked to pnpm@11.24.0");
  }
}

async function checkForbiddenPaths() {
  for (const forbiddenPath of forbiddenPaths) {
    if (await exists(forbiddenPath)) {
      fail(`Stale/dead path still exists -> ${forbiddenPath}`);
    } else {
      pass(`stale/dead path absent -> ${forbiddenPath}`);
    }
  }
}

async function checkEnvironmentContracts() {
  await requireMatch(
    "apps/nexora-core/.env.example",
    /^NEXORA_PUBLIC_URL=/m,
    "Core env declares NEXORA_PUBLIC_URL",
  );

  await requireMatch(
    "apps/nexora-core/.env.example",
    /^NEXORA_CONSOLE_URL=/m,
    "Core env declares NEXORA_CONSOLE_URL",
  );

  await requireMatch(
    "apps/nexora-console/.env.example",
    /^NEXORA_CORE_URL=/m,
    "Console env declares NEXORA_CORE_URL",
  );
}

async function checkPosterSecurity() {
  const file = "apps/nexora-core/src/app/watch/[slug]/poster/route.ts";

  await forbidText(
    file,
    "limitInputPixels: false",
    "Poster must never disable Sharp pixel limits",
  );

  await requireText(
    file,
    "POSTER_MAX_INPUT_PIXELS",
    "Poster has explicit decoded-pixel limit",
  );

  await requireText(
    file,
    "POSTER_MAX_CONCURRENT_GENERATIONS",
    "Poster has per-process concurrency protection",
  );

  await requireText(
    file,
    "isCanonicalVersionRequest",
    "Poster validates canonical version query",
  );

  await requireText(
    file,
    '"if-none-match"',
    "Poster supports conditional ETag requests",
  );

  await requireText(file, "ETag", "Poster emits ETag response header");
}

async function checkEmailVerificationSecurity() {
  const file = "apps/nexora-core/src/app/api/account/email/verify/route.ts";

  await forbidMatch(
    file,
    /export\s+async\s+function\s+GET\s*\(/,
    "Email verification route must not mutate through GET",
  );

  await requireMatch(
    file,
    /export\s+async\s+function\s+POST\s*\(/,
    "Email verification mutation uses POST",
  );
}

async function checkPublicOriginSecurity() {
  const file = "apps/nexora-core/src/app/watch/[slug]/route.ts";

  await requireText(
    file,
    "NEXORA_PUBLIC_URL",
    "Public Shortlink origin uses configured public URL",
  );

  await forbidText(
    file,
    '"x-forwarded-host"',
    "Public origin must not trust X-Forwarded-Host",
  );

  await forbidText(
    file,
    '"x-forwarded-proto"',
    "Public origin must not trust X-Forwarded-Proto",
  );

  await forbidMatch(
    file,
    /headers\.get\(["']host["']\)/,
    "Public origin must not trust Host header",
  );
}

async function checkShortlinkCacheInvalidation() {
  const createRoute = "apps/nexora-core/src/app/api/shortlinks/route.ts";
  const itemRoute = "apps/nexora-core/src/app/api/shortlinks/[id]/route.ts";

  await requireText(
    createRoute,
    "invalidateDashboardCache",
    "Shortlink CREATE invalidates Dashboard cache",
  );

  const itemRouteSource = await readText(itemRoute);

  if (!itemRouteSource) {
    return;
  }

  const occurrences = countOccurrences(
    itemRouteSource,
    "invalidateDashboardCache();",
  );

  if (occurrences >= 2) {
    pass("Shortlink UPDATE and DELETE invalidate Dashboard cache");
  } else {
    fail(
      "Shortlink item route must invalidate Dashboard cache after UPDATE and DELETE",
    );
  }
}

async function checkSecurityHeaders() {
  for (const file of [
    "apps/nexora-core/next.config.ts",
    "apps/nexora-console/next.config.ts",
  ]) {
    await requireText(
      file,
      "Content-Security-Policy",
      `${file} configures CSP`,
    );

    await requireText(
      file,
      "X-Content-Type-Options",
      `${file} configures nosniff`,
    );

    await requireText(
      file,
      "X-Frame-Options",
      `${file} configures anti-framing`,
    );

    await requireText(
      file,
      "Referrer-Policy",
      `${file} configures Referrer-Policy`,
    );

    await requireText(
      file,
      "Permissions-Policy",
      `${file} configures Permissions-Policy`,
    );

    await requireText(
      file,
      "Strict-Transport-Security",
      `${file} configures production HSTS`,
    );

    await requireText(
      file,
      "frame-ancestors 'none'",
      `${file} CSP prevents framing`,
    );
  }
}

async function checkProductionDocumentation() {
  const file = "docs/PRODUCTION.md";

  const requiredSections = [
    "## Architecture",
    "## Required Environment",
    "## Deployment Order",
    "## Database Migration",
    "## Reverse Proxy and HTTPS",
    "## Health and Readiness",
    "## Release Verification",
    "## Runtime Security",
    "## Rollback",
  ];

  for (const section of requiredSections) {
    await requireText(file, section, `Production guide contains ${section}`);
  }
}

async function requireText(relativePath, value, description) {
  const content = await readText(relativePath);

  if (content === null) {
    return;
  }

  if (content.includes(value)) {
    pass(description);
  } else {
    fail(`${description} -> missing "${value}"`);
  }
}

async function forbidText(relativePath, value, description) {
  const content = await readText(relativePath);

  if (content === null) {
    return;
  }

  if (!content.includes(value)) {
    pass(description);
  } else {
    fail(`${description} -> forbidden "${value}" found`);
  }
}

async function requireMatch(relativePath, pattern, description) {
  const content = await readText(relativePath);

  if (content === null) {
    return;
  }

  if (pattern.test(content)) {
    pass(description);
  } else {
    fail(`${description} -> required pattern not found`);
  }
}

async function forbidMatch(relativePath, pattern, description) {
  const content = await readText(relativePath);

  if (content === null) {
    return;
  }

  if (!pattern.test(content)) {
    pass(description);
  } else {
    fail(`${description} -> forbidden pattern found`);
  }
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readText(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch (error) {
    fail(`Unable to read ${relativePath}: ${formatError(error)}`);
    return null;
  }
}

async function readJson(relativePath) {
  const content = await readText(relativePath);

  if (content === null) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    fail(`Unable to parse ${relativePath}: ${formatError(error)}`);
    return null;
  }
}

function countOccurrences(content, value) {
  if (!value) {
    return 0;
  }

  return content.split(value).length - 1;
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failed++;
  console.error(`FAIL ${message}`);
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}
