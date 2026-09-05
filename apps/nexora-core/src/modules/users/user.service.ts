import { randomBytes } from "node:crypto";

import {
  SUPER_ADMIN_ROLE_CODE,
  createUserSchema,
  updateUserSchema,
  userListQuerySchema,
  type CreateUserResult,
  type PaginatedResult,
  type User,
  type UserListItem,
} from "@nexora/contracts";

import { auth } from "@/auth";
import { logger } from "@/lib/observability/logger";

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

function createTemporaryPassword(): string {
  return randomBytes(48).toString("base64url");
}

function getInvitationRedirectUrl(): string {
  const value = process.env.NEXORA_CONSOLE_URL?.trim();

  if (!value) {
    throw new Error("NEXORA_CONSOLE_URL is not configured");
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXORA_CONSOLE_URL must be a valid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXORA_CONSOLE_URL must use http or https");
  }

  return `${url.origin}/accept-invitation`;
}

async function sendUserInvitation(email: string): Promise<void> {
  await auth.api.requestPasswordReset({
    body: {
      email,
      redirectTo: getInvitationRedirectUrl(),
    },
  });
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

export async function createUser(input: unknown): Promise<CreateUserResult> {
  const data = createUserSchema.parse(input);

  /*
   * Create User bukan Resend Invitation.
   *
   * Email yang sudah ada, termasuk account yang masih Pending,
   * harus berhenti di sini dan tidak boleh menghasilkan email baru.
   */
  const existing = await userRepository.findByEmail(data.email);

  if (existing) {
    throw new Error(USER_ERRORS.EMAIL_EXISTS);
  }

  const roleId = await validateAssignableRole(data.roleId);
  const temporaryPassword = createTemporaryPassword();

  const signUpResult = await auth.api.signUpEmail({
    body: {
      name: data.name,
      email: data.email,
      password: temporaryPassword,
    },
  });

  const createdUserId = signUpResult.user.id;

  const created = await userRepository.findById(createdUserId);

  if (!created || created.email !== data.email) {
    throw new Error(USER_ERRORS.CREATION_FAILED);
  }

  let user: Awaited<ReturnType<typeof userRepository.configureCreatedUser>>;

  try {
    user = await userRepository.configureCreatedUser(createdUserId, {
      status: data.status,
      roleId,
    });

    if (!user.userRole) {
      throw new Error(USER_ERRORS.CREATION_FAILED);
    }
  } catch (error) {
    await userRepository
      .delete(createdUserId)
      .catch((cleanupError: unknown) => {
        logger.error("user.create.rollback-failed", {
          userId: createdUserId,
          error: cleanupError,
        });
      });

    throw error;
  }

  const mappedUser = mapUser(user);

  /*
   * User sudah valid tersimpan.
   * Kegagalan provider email tidak menghapus account.
   */
  let invitationSent = true;

  try {
    await sendUserInvitation(mappedUser.email);
  } catch (error) {
    invitationSent = false;

    logger.error("user.invitation.delivery-failed", {
      userId: mappedUser.id,
      email: mappedUser.email,
      error,
    });
  }

  return {
    user: mappedUser,
    invitationSent,
  };
}

export async function resendUserInvitation(id: string): Promise<User> {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new Error(USER_ERRORS.NOT_FOUND);
  }

  /*
   * Verified account tidak boleh menerima invitation lagi.
   *
   * Ini divalidasi di server, jadi bukan sekadar penyembunyian
   * tombol pada Console.
   */
  if (existing.emailVerified) {
    throw new Error(USER_ERRORS.INVITATION_ALREADY_COMPLETED);
  }

  const user = mapUser(existing);

  try {
    await sendUserInvitation(user.email);
  } catch (error) {
    logger.error("user.invitation.resend-failed", {
      userId: user.id,
      email: user.email,
      error,
    });

    throw new Error(USER_ERRORS.INVITATION_DELIVERY_FAILED);
  }

  return user;
}

export async function updateUser(
  id: string,
  input: unknown,
  actorUserId: string,
): Promise<UpdateUserResult> {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new Error(USER_ERRORS.NOT_FOUND);
  }

  const before = mapUser(existing);
  const data = updateUserSchema.parse(input);
  const protectedUser = isSuperAdminUser(existing);

  const statusChanged =
    data.status !== undefined && data.status !== existing.status;

  if (protectedUser && statusChanged) {
    throw new Error(USER_ERRORS.SUPER_ADMIN_STATUS_UPDATE);
  }

  if (id === actorUserId && statusChanged && data.status !== "ACTIVE") {
    throw new Error(USER_ERRORS.SELF_STATUS_UPDATE);
  }

  if (protectedUser && data.roleId !== undefined) {
    throw new Error(USER_ERRORS.SUPER_ADMIN_ROLES_UPDATE);
  }

  let roleId: string | undefined;
  let roleChanged = false;

  if (data.roleId !== undefined) {
    roleId = await validateAssignableRole(data.roleId);
    roleChanged = roleId !== existing.userRole?.role.id;
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
    revokeSessions: statusChanged || roleChanged,
  });

  return {
    before,
    result: mapUser(updated),
  };
}

export async function deleteUser(
  id: string,
  actorUserId: string,
): Promise<User> {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new Error(USER_ERRORS.NOT_FOUND);
  }

  if (id === actorUserId) {
    throw new Error(USER_ERRORS.SELF_DELETE);
  }

  if (isSuperAdminUser(existing)) {
    throw new Error(USER_ERRORS.SUPER_ADMIN_DELETE);
  }

  const user = mapUser(existing);

  await userRepository.delete(id);

  return user;
}
