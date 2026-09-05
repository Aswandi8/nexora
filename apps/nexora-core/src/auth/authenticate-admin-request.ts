import { permissionCodeSchema, type PermissionCode } from "@nexora/contracts";

import { auth } from "@/auth/auth";
import { prisma } from "@/database";

export type AuthenticatedAdmin = {
  user: {
    id: string;
    name: string;
    email: string;
    status: "ACTIVE";
  };
  permissions: PermissionCode[];
};

function parsePermissionCodes(codes: string[]): PermissionCode[] {
  const permissions: PermissionCode[] = [];

  for (const code of codes) {
    const parsed = permissionCodeSchema.safeParse(code);

    if (parsed.success) {
      permissions.push(parsed.data);
    }
  }

  return permissions;
}

export async function authenticateAdminRequest(
  headers: Headers,
): Promise<AuthenticatedAdmin> {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session?.user?.id) {
    throw new Error("AUTH_REQUIRED");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      userRole: {
        select: {
          role: {
            select: {
              rolePermissions: {
                select: {
                  permission: {
                    select: {
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("AUTH_REQUIRED");
  }

  if (user.status === "INACTIVE") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  if (user.status === "SUSPENDED") {
    throw new Error("ACCOUNT_SUSPENDED");
  }

  const permissionCodes =
    user.userRole?.role.rolePermissions.map(
      (rolePermission) => rolePermission.permission.code,
    ) ?? [];

  const permissions = parsePermissionCodes(permissionCodes);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: "ACTIVE",
    },
    permissions,
  };
}
