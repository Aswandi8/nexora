import { permissionCodeSchema, type PermissionCode } from "@nexora/contracts";

import { auth } from "@/auth/auth";
import { prisma } from "@/database";

export type AuthenticatedAdmin = {
  session: {
    id: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    status: "ACTIVE";
    role: {
      id: string;
      name: string;
      code: string;
      isSystem: boolean;
    } | null;
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

  if (!session?.session?.id || !session.user?.id) {
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
      emailVerified: true,
      status: true,
      userRole: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              code: true,
              isSystem: true,
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

  const role = user.userRole?.role ?? null;

  const permissionCodes =
    role?.rolePermissions.map(
      (rolePermission) => rolePermission.permission.code,
    ) ?? [];

  return {
    session: {
      id: session.session.id,
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      status: "ACTIVE",
      role: role
        ? {
            id: role.id,
            name: role.name,
            code: role.code,
            isSystem: role.isSystem,
          }
        : null,
    },
    permissions: parsePermissionCodes(permissionCodes),
  };
}
