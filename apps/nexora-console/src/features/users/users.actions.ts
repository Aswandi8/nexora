"use server";

import {
  createUserResultSchema,
  createUserSchema,
  updateUserSchema,
  userStatusSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@nexora/contracts";

import { revalidatePath } from "next/cache";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";
import { serverApiRequest } from "@/lib/api/server";

export interface CreateUserActionResult extends ActionResult {
  invitationSent?: boolean;
}

export type UserActionResult = ActionResult;

function revalidateUserPaths(id?: string) {
  revalidatePath("/users");
  revalidatePath("/dashboard");

  if (id) {
    revalidatePath(`/users/${id}`);
    revalidatePath(`/users/${id}/edit`);
  }
}

export async function createUserAction(
  input: CreateUserInput,
): Promise<CreateUserActionResult> {
  try {
    const data = createUserSchema.parse(input);

    const response = await serverApiRequest("/api/users", {
      method: "POST",
      body: data,
      cache: "no-store",
    });

    const result = createUserResultSchema.parse(response);

    revalidateUserPaths();

    return {
      success: true,
      invitationSent: result.invitationSent,
    };
  } catch (error) {
    return actionFailure<CreateUserActionResult>(
      error,
      "Unable to create user.",
    );
  }
}

export async function resendUserInvitationAction(
  id: string,
): Promise<UserActionResult> {
  try {
    await serverApiRequest(`/api/users/${id}/resend-invitation`, {
      method: "POST",
      cache: "no-store",
    });

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to resend invitation.");
  }
}

export async function updateUserAction(
  id: string,
  input: UpdateUserInput,
): Promise<UserActionResult> {
  try {
    const data = updateUserSchema.parse(input);

    await serverApiRequest(`/api/users/${id}`, {
      method: "PATCH",
      body: data,
      cache: "no-store",
    });

    revalidateUserPaths(id);

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to update user.");
  }
}

export async function updateUserStatusAction(
  id: string,
  status: unknown,
): Promise<UserActionResult> {
  try {
    const parsedStatus = userStatusSchema.parse(status);

    const data = updateUserSchema.parse({
      status: parsedStatus,
    });

    await serverApiRequest(`/api/users/${id}`, {
      method: "PATCH",
      body: data,
      cache: "no-store",
    });

    revalidateUserPaths(id);

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to update user status.");
  }
}

export async function updateUserRoleAction(
  id: string,
  roleId: string,
): Promise<UserActionResult> {
  try {
    const data = updateUserSchema.parse({
      roleId,
    });

    await serverApiRequest(`/api/users/${id}`, {
      method: "PATCH",
      body: data,
      cache: "no-store",
    });

    revalidateUserPaths(id);

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to update user role.");
  }
}

export async function deleteUserAction(id: string): Promise<UserActionResult> {
  try {
    await serverApiRequest(`/api/users/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    revalidateUserPaths();

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to delete user.");
  }
}
