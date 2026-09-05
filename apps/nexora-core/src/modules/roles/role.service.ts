import {
  createRoleSchema,
  isSuperAdminRoleCode,
  isSystemRoleCode,
  roleListQuerySchema,
  updateRoleSchema,
  type PaginatedResult,
  type Role,
  type RoleListItem,
} from "@nexora/contracts";

import { ROLE_ERRORS } from "./role.errors";
import { mapRole, mapRoleListItem } from "./role.mapper";
import { roleRepository } from "./role.repository";

export type UpdateRoleResult = {
  before: Role;
  result: Role;
};

export async function listRoles(
  input: unknown,
): Promise<PaginatedResult<RoleListItem>> {
  const query = roleListQuerySchema.parse(input);
  const skip = (query.page - 1) * query.limit;

  const [roles, total] = await Promise.all([
    roleRepository.findMany({
      skip,
      take: query.limit,
      search: query.search,
      type: query.type,
    }),
    roleRepository.count({
      search: query.search,
      type: query.type,
    }),
  ]);

  return {
    items: roles.map(mapRoleListItem),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getRoleById(id: string): Promise<Role> {
  const role = await roleRepository.findById(id);

  if (!role) {
    throw new Error(ROLE_ERRORS.NOT_FOUND);
  }

  return mapRole(role);
}

export async function createRole(input: unknown): Promise<Role> {
  const data = createRoleSchema.parse(input);

  if (isSystemRoleCode(data.code)) {
    throw new Error(ROLE_ERRORS.SYSTEM_ROLE_CODE_RESERVED);
  }

  const role = await roleRepository.create({
    name: data.name,
    code: data.code,
    description: data.description || null,
    permissions: data.permissions,
  });

  return mapRole(role);
}

export async function updateRole(
  id: string,
  input: unknown,
): Promise<UpdateRoleResult> {
  const existing = await roleRepository.findById(id);

  if (!existing) {
    throw new Error(ROLE_ERRORS.NOT_FOUND);
  }

  if (isSuperAdminRoleCode(existing.code)) {
    throw new Error(ROLE_ERRORS.SUPER_ADMIN_ROLE_UPDATE);
  }

  const before = mapRole(existing);
  const data = updateRoleSchema.parse(input);

  if (
    existing.isSystem &&
    data.code !== undefined &&
    data.code !== existing.code
  ) {
    throw new Error(ROLE_ERRORS.SYSTEM_ROLE_CODE_UPDATE);
  }

  if (
    data.code !== undefined &&
    data.code !== existing.code &&
    isSystemRoleCode(data.code)
  ) {
    throw new Error(ROLE_ERRORS.SYSTEM_ROLE_CODE_RESERVED);
  }

  const role = await roleRepository.update(id, {
    name: data.name,
    code: existing.isSystem ? undefined : data.code,
    description:
      data.description === undefined ? undefined : data.description || null,
    permissions: data.permissions,
  });

  return {
    before,
    result: mapRole(role),
  };
}

export async function deleteRole(id: string): Promise<Role> {
  const existing = await roleRepository.findById(id);

  if (!existing) {
    throw new Error(ROLE_ERRORS.NOT_FOUND);
  }

  if (isSuperAdminRoleCode(existing.code)) {
    throw new Error(ROLE_ERRORS.SUPER_ADMIN_ROLE_DELETE);
  }

  if (existing.isSystem) {
    throw new Error(ROLE_ERRORS.SYSTEM_ROLE_DELETE);
  }

  const role = mapRole(existing);

  await roleRepository.delete(id);

  return role;
}
