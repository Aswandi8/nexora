import {
  SUPER_ADMIN_ROLE_CODE,
  permissionCodeSchema,
  roleSchema,
  userListItemSchema,
  userSchema,
  type PermissionCode,
  type User,
  type UserListItem,
} from "@nexora/contracts";

import type { Prisma } from "@/generated/prisma/client";

type UserListRecord = Prisma.UserGetPayload<{
  include: {
    userRole: {
      include: {
        role: true;
      };
    };
  };
}>;

type UserDetailRecord = Prisma.UserGetPayload<{
  include: {
    userRole: {
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true;
              };
            };
          };
        };
      };
    };
  };
}>;

function requireListRole(user: UserListRecord) {
  if (!user.userRole) {
    throw new Error("USER_ROLE_NOT_FOUND");
  }

  return user.userRole.role;
}

function requireDetailRole(user: UserDetailRecord) {
  if (!user.userRole) {
    throw new Error("USER_ROLE_NOT_FOUND");
  }

  return user.userRole.role;
}

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

export function mapUserListItem(user: UserListRecord): UserListItem {
  const assignedRole = requireListRole(user);

  const role = {
    id: assignedRole.id,
    name: assignedRole.name,
    code: assignedRole.code,
    isSystem: assignedRole.isSystem,
  };

  return userListItemSchema.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    role,
    isSuperAdmin: role.code === SUPER_ADMIN_ROLE_CODE,
    createdAt: user.createdAt.toISOString(),
  });
}

export function mapUser(user: UserDetailRecord): User {
  const assignedRole = requireDetailRole(user);

  const permissions = parsePermissionCodes(
    assignedRole.rolePermissions.map(({ permission }) => permission.code),
  );

  const role = roleSchema.parse({
    id: assignedRole.id,
    name: assignedRole.name,
    code: assignedRole.code,
    description: assignedRole.description,
    isSystem: assignedRole.isSystem,
    permissions,
  });

  return userSchema.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    role,
    permissions,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
}
