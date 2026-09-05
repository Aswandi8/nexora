import "dotenv/config";

import { seedAdmin, seedPermissions, seedRoles } from "../src/database/seed";

async function main(): Promise<void> {
  console.log("");
  console.log("Nexora database seed");
  console.log("--------------------");

  await seedPermissions();
  await seedRoles();
  await seedAdmin();

  console.log("--------------------");
  console.log("✓ Seed completed");
  console.log("");
}

main().catch((error: unknown) => {
  console.error("");
  console.error("Seed failed:");
  console.error(error);
  console.error("");

  process.exitCode = 1;
});
