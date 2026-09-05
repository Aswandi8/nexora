import { PERMISSIONS, type PermissionCode } from "@nexora/contracts";

import { prisma } from "@/database";

type PermissionSeed = {
  code: PermissionCode;
  name: string;
  description: string;
};

export const CURRENT_PERMISSION_CODES = [
  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_CREATE,
  PERMISSIONS.USERS_UPDATE,
  PERMISSIONS.USERS_DELETE,

  PERMISSIONS.ROLES_READ,
  PERMISSIONS.ROLES_CREATE,
  PERMISSIONS.ROLES_UPDATE,
  PERMISSIONS.ROLES_DELETE,

  PERMISSIONS.PERMISSIONS_READ,
  PERMISSIONS.PERMISSIONS_ASSIGN,

  PERMISSIONS.SHORTLINKS_READ,
  PERMISSIONS.SHORTLINKS_CREATE,
  PERMISSIONS.SHORTLINKS_UPDATE,
  PERMISSIONS.SHORTLINKS_DELETE,
] satisfies PermissionCode[];

const LEGACY_X_PERMISSION_CODES = [
  "x_accounts.read",
  "x_accounts.connect",
  "x_accounts.disconnect",
  "x_posts.read",
  "x_posts.create",
  "x_posts.update",
  "x_posts.delete",
  "x_posts.publish",
] as const;

const PERMISSION_SEEDS: PermissionSeed[] = [
  {
    code: PERMISSIONS.USERS_READ,
    name: "Read Users",
    description: "View users.",
  },
  {
    code: PERMISSIONS.USERS_CREATE,
    name: "Create Users",
    description: "Create users.",
  },
  {
    code: PERMISSIONS.USERS_UPDATE,
    name: "Update Users",
    description: "Update users.",
  },
  {
    code: PERMISSIONS.USERS_DELETE,
    name: "Delete Users",
    description: "Delete users.",
  },

  {
    code: PERMISSIONS.ROLES_READ,
    name: "Read Roles",
    description: "View roles.",
  },
  {
    code: PERMISSIONS.ROLES_CREATE,
    name: "Create Roles",
    description: "Create roles.",
  },
  {
    code: PERMISSIONS.ROLES_UPDATE,
    name: "Update Roles",
    description: "Update roles.",
  },
  {
    code: PERMISSIONS.ROLES_DELETE,
    name: "Delete Roles",
    description: "Delete roles.",
  },

  {
    code: PERMISSIONS.PERMISSIONS_READ,
    name: "Read Permissions",
    description: "View permissions.",
  },
  {
    code: PERMISSIONS.PERMISSIONS_ASSIGN,
    name: "Assign Permissions",
    description: "Assign permissions to roles.",
  },

  {
    code: PERMISSIONS.SHORTLINKS_READ,
    name: "Read Shortlinks",
    description: "View shortlinks.",
  },
  {
    code: PERMISSIONS.SHORTLINKS_CREATE,
    name: "Create Shortlinks",
    description: "Create shortlinks.",
  },
  {
    code: PERMISSIONS.SHORTLINKS_UPDATE,
    name: "Update Shortlinks",
    description: "Update shortlinks.",
  },
  {
    code: PERMISSIONS.SHORTLINKS_DELETE,
    name: "Delete Shortlinks",
    description: "Delete shortlinks.",
  },
];

export async function seedPermissions(): Promise<void> {
  await prisma.permission.deleteMany({
    where: {
      code: {
        in: [...LEGACY_X_PERMISSION_CODES],
      },
    },
  });

  for (const permission of PERMISSION_SEEDS) {
    await prisma.permission.upsert({
      where: {
        code: permission.code,
      },

      update: {
        name: permission.name,
        description: permission.description,
      },

      create: {
        code: permission.code,
        name: permission.name,
        description: permission.description,
      },
    });
  }

  console.log(`✓ Permissions seeded: ${PERMISSION_SEEDS.length}`);
}
