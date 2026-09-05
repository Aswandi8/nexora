import {
  permissionCodeSchema,
  type PermissionCode,
  type Role,
  type RoleListItem,
} from "@nexora/contracts";

interface RoleCount {
  userRoles: number;
  rolePermissions: number;
}

interface RoleListSource {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isSystem: boolean;
  _count: RoleCount;
}

interface RolePermissionSource {
  permission: {
    code: string;
  };
}

interface RoleDetailSource {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isSystem: boolean;
  rolePermissions: RolePermissionSource[];
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

export function mapRoleListItem(role: RoleListSource): RoleListItem {
  return {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    isSystem: role.isSystem,
    userCount: role._count.userRoles,
    permissionCount: role._count.rolePermissions,
  };
}

export function mapRole(role: RoleDetailSource): Role {
  return {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    isSystem: role.isSystem,
    permissions: parsePermissionCodes(
      role.rolePermissions.map(({ permission }) => permission.code),
    ),
  };
}
