import { SYSTEM_ROLES } from "@nexora/contracts";

import { prisma } from "@/database";

import { CURRENT_PERMISSION_CODES } from "./permissions";

const ROLE_SEEDS = [
  {
    code: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Full administrative access to Nexora.",
  },
  {
    code: "ADMIN",
    name: "Admin",
    description: "Administrative role.",
  },
  {
    code: "MANAGER",
    name: "Manager",
    description: "Management role.",
  },
  {
    code: "OPERATOR",
    name: "Operator",
    description: "Operational role.",
  },
  {
    code: "VIEWER",
    name: "Viewer",
    description: "Read-oriented role.",
  },
] satisfies Array<{
  code: (typeof SYSTEM_ROLES)[number];
  name: string;
  description: string;
}>;

async function syncSuperAdminPermissions(): Promise<void> {
  const superAdmin = await prisma.role.findUnique({
    where: {
      code: "SUPER_ADMIN",
    },
    select: {
      id: true,
    },
  });

  if (!superAdmin) {
    throw new Error("SUPER_ADMIN_ROLE_NOT_FOUND");
  }

  const permissions = await prisma.permission.findMany({
    where: {
      code: {
        in: CURRENT_PERMISSION_CODES,
      },
    },
    select: {
      id: true,
      code: true,
    },
  });

  if (permissions.length !== CURRENT_PERMISSION_CODES.length) {
    const found = new Set(permissions.map((permission) => permission.code));

    const missing = CURRENT_PERMISSION_CODES.filter((code) => !found.has(code));

    throw new Error(`PERMISSIONS_NOT_FOUND: ${missing.join(", ")}`);
  }

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: superAdmin.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  console.log(`✓ SUPER_ADMIN permissions synchronized: ${permissions.length}`);
}

export async function seedRoles(): Promise<void> {
  for (const role of ROLE_SEEDS) {
    await prisma.role.upsert({
      where: {
        code: role.code,
      },
      update: {
        name: role.name,
        description: role.description,
        isSystem: true,
      },
      create: {
        code: role.code,
        name: role.name,
        description: role.description,
        isSystem: true,
      },
    });
  }

  await syncSuperAdminPermissions();

  console.log(`✓ Roles seeded: ${ROLE_SEEDS.length}`);
}
