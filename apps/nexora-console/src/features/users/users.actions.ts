"use server";

import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@nexora/contracts";

import { revalidatePath } from "next/cache";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";

import { serverApiRequest } from "@/lib/api/server";

export type UserActionResult = ActionResult;

export async function createUserAction(
  input: CreateUserInput,
): Promise<UserActionResult> {
  try {
    const data = createUserSchema.parse(input);

    await serverApiRequest("/api/users", {
      method: "POST",
      body: data,
      cache: "no-store",
    });

    revalidatePath("/users");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to create user.");
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

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    revalidatePath(`/users/${id}/edit`);
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to update user.");
  }
}

export async function deleteUserAction(id: string): Promise<UserActionResult> {
  try {
    await serverApiRequest(`/api/users/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    revalidatePath("/users");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to delete user.");
  }
}
