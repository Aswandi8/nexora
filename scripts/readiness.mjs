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
  ".github/workflows/ci.yml",
];

const requiredScripts = [
  "build",
  "build:core",
  "build:console",
  "check",
  "test:smoke",
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

for (const file of requiredFiles) {
  if (await exists(file)) {
    console.log(`PASS required file -> ${file}`);
  } else {
    fail(`Missing required file -> ${file}`);
  }
}

const packageJson = await readJson("package.json");

if (packageJson) {
  for (const script of requiredScripts) {
    if (
      typeof packageJson.scripts?.[script] === "string" &&
      packageJson.scripts[script].trim()
    ) {
      console.log(`PASS package script -> ${script}`);
    } else {
      fail(`Missing package script -> ${script}`);
    }
  }
}

await requireNonEmpty("README.md");
await requireNonEmpty("docs/PRODUCTION.md");
await requireNonEmpty("apps/nexora-core/.env.example");
await requireNonEmpty("apps/nexora-console/.env.example");

for (const forbiddenPath of forbiddenPaths) {
  if (await exists(forbiddenPath)) {
    fail(`Stale/dead path still exists -> ${forbiddenPath}`);
  } else {
    console.log(`PASS stale/dead path absent -> ${forbiddenPath}`);
  }
}

console.log("---------------------------");

if (failed > 0) {
  console.error(`Readiness failed: ${failed} issue(s) found.`);
  process.exit(1);
}

console.log("Production readiness checks passed.");

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function requireNonEmpty(relativePath) {
  try {
    const content = await readFile(path.join(root, relativePath), "utf8");

    if (content.trim()) {
      console.log(`PASS non-empty file -> ${relativePath}`);
      return;
    }

    fail(`Required file is empty -> ${relativePath}`);
  } catch {
    fail(`Unable to read required file -> ${relativePath}`);
  }
}

async function readJson(relativePath) {
  try {
    const content = await readFile(path.join(root, relativePath), "utf8");
    return JSON.parse(content);
  } catch (error) {
    fail(`Unable to read ${relativePath}: ${formatError(error)}`);
    return null;
  }
}

function fail(message) {
  failed++;
  console.error(`FAIL ${message}`);
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}
