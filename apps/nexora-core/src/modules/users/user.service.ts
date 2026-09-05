import {
  SUPER_ADMIN_ROLE_CODE,
  createUserSchema,
  updateUserSchema,
  userListQuerySchema,
  type PaginatedResult,
  type User,
  type UserListItem,
} from "@nexora/contracts";

import { auth } from "@/auth";

import { USER_ERRORS } from "./user.errors";
import { mapUser, mapUserListItem } from "./user.mapper";
import { userRepository } from "./user.repository";

export type UpdateUserResult = {
  before: User;
  result: User;
};

async function validateAssignableRole(roleId: string): Promise<string> {
  const role = await userRepository.findRoleById(roleId);

  if (!role) {
    throw new Error(USER_ERRORS.ROLE_NOT_FOUND);
  }

  if (role.code === SUPER_ADMIN_ROLE_CODE) {
    throw new Error(USER_ERRORS.SUPER_ADMIN_ASSIGNMENT);
  }

  return role.id;
}

function isSuperAdminUser(
  user: Awaited<ReturnType<typeof userRepository.findById>>,
): boolean {
  return user?.userRole?.role.code === SUPER_ADMIN_ROLE_CODE;
}

export async function listUsers(
  input: unknown,
): Promise<PaginatedResult<UserListItem>> {
  const query = userListQuerySchema.parse(input);
  const skip = (query.page - 1) * query.limit;

  const [users, total] = await Promise.all([
    userRepository.findMany({
      skip,
      take: query.limit,
      search: query.search,
      status: query.status,
    }),
    userRepository.count({
      search: query.search,
      status: query.status,
    }),
  ]);

  return {
    items: users.map(mapUserListItem),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getUserById(id: string): Promise<User> {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new Error(USER_ERRORS.NOT_FOUND);
  }

  return mapUser(user);
}

export async function createUser(input: unknown): Promise<User> {
  const data = createUserSchema.parse(input);

  const existing = await userRepository.findByEmail(data.email);

  if (existing) {
    throw new Error(USER_ERRORS.EMAIL_EXISTS);
  }

  const roleId = await validateAssignableRole(data.roleId);

  await auth.api.signUpEmail({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  });

  const created = await userRepository.findByEmail(data.email);

  if (!created) {
    throw new Error(USER_ERRORS.CREATION_FAILED);
  }

  try {
    const user = await userRepository.configureCreatedUser(created.id, {
      status: data.status,
      roleId,
    });

    if (!user.userRole) {
      throw new Error(USER_ERRORS.CREATION_FAILED);
    }

    return mapUser(user);
  } catch (error) {
    await userRepository.delete(created.id).catch((cleanupError: unknown) => {
      console.error("Failed to rollback newly created user.", cleanupError);
    });

    throw error;
  }
}

export async function updateUser(
  id: string,
  input: unknown,
): Promise<UpdateUserResult> {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new Error(USER_ERRORS.NOT_FOUND);
  }

  const before = mapUser(existing);
  const data = updateUserSchema.parse(input);
  const protectedUser = isSuperAdminUser(existing);

  if (
    protectedUser &&
    data.status !== undefined &&
    data.status !== existing.status
  ) {
    throw new Error(USER_ERRORS.SUPER_ADMIN_STATUS_UPDATE);
  }

  if (protectedUser && data.roleId !== undefined) {
    throw new Error(USER_ERRORS.SUPER_ADMIN_ROLES_UPDATE);
  }

  let roleId: string | undefined;

  if (data.roleId !== undefined) {
    roleId = await validateAssignableRole(data.roleId);
  }

  if (data.email !== undefined && data.email !== existing.email) {
    const emailOwner = await userRepository.findByEmail(data.email);

    if (emailOwner && emailOwner.id !== id) {
      throw new Error(USER_ERRORS.EMAIL_EXISTS);
    }
  }

  const updated = await userRepository.update(id, {
    name: data.name,
    email: data.email,
    status: protectedUser ? undefined : data.status,
    roleId: protectedUser ? undefined : roleId,
  });

  return {
    before,
    result: mapUser(updated),
  };
}

export async function deleteUser(id: string): Promise<User> {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new Error(USER_ERRORS.NOT_FOUND);
  }

  if (isSuperAdminUser(existing)) {
    throw new Error(USER_ERRORS.SUPER_ADMIN_DELETE);
  }

  const user = mapUser(existing);

  await userRepository.delete(id);

  return user;
}
