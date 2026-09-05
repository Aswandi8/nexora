import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/database";

const adminEnvironmentSchema = z.object({
  NEXORA_ADMIN_NAME: z.string().trim().min(2).max(100),

  NEXORA_ADMIN_EMAIL: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  NEXORA_ADMIN_PASSWORD: z.string().min(8).max(128),
});

type AdminEnvironment = z.infer<typeof adminEnvironmentSchema>;

function getAdminEnvironment(): AdminEnvironment {
  return adminEnvironmentSchema.parse({
    NEXORA_ADMIN_NAME: process.env.NEXORA_ADMIN_NAME,

    NEXORA_ADMIN_EMAIL: process.env.NEXORA_ADMIN_EMAIL,

    NEXORA_ADMIN_PASSWORD: process.env.NEXORA_ADMIN_PASSWORD,
  });
}

async function getOrCreateAdminUser(environment: AdminEnvironment) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: environment.NEXORA_ADMIN_EMAIL,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  await auth.api.signUpEmail({
    body: {
      name: environment.NEXORA_ADMIN_NAME,

      email: environment.NEXORA_ADMIN_EMAIL,

      password: environment.NEXORA_ADMIN_PASSWORD,
    },
  });

  const createdUser = await prisma.user.findUnique({
    where: {
      email: environment.NEXORA_ADMIN_EMAIL,
    },
  });

  if (!createdUser) {
    throw new Error("ADMIN_USER_CREATION_FAILED");
  }

  return createdUser;
}

export async function seedAdmin(): Promise<void> {
  const environment = getAdminEnvironment();

  const superAdminRole = await prisma.role.findUnique({
    where: {
      code: "SUPER_ADMIN",
    },

    select: {
      id: true,
    },
  });

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN_ROLE_NOT_FOUND");
  }

  const admin = await getOrCreateAdminUser(environment);

  if (admin.status !== "ACTIVE") {
    await prisma.user.update({
      where: {
        id: admin.id,
      },

      data: {
        status: "ACTIVE",
      },
    });
  }

  /*
   * userId is UNIQUE in the single-role architecture.
   *
   * The protected bootstrap is allowed to ensure that
   * the configured administrator holds SUPER_ADMIN.
   */
  await prisma.userRole.upsert({
    where: {
      userId: admin.id,
    },

    update: {
      roleId: superAdminRole.id,
    },

    create: {
      userId: admin.id,
      roleId: superAdminRole.id,
    },
  });

  console.log(`✓ Admin ready: ${environment.NEXORA_ADMIN_EMAIL}`);

  console.log("✓ SUPER_ADMIN role assigned");
}
