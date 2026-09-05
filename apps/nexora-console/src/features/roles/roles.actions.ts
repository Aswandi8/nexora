"use server";

import {
  createRoleSchema,
  updateRoleSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
} from "@nexora/contracts";

import { revalidatePath } from "next/cache";

import { serverApiRequest } from "@/lib/api/server";

export type RoleActionResult = {
  success: boolean;
  message?: string;
};

export async function createRoleAction(
  input: CreateRoleInput,
): Promise<RoleActionResult> {
  try {
    const data = createRoleSchema.parse(input);

    await serverApiRequest("/api/roles", {
      method: "POST",
      body: data,
      cache: "no-store",
    });

    revalidatePath("/roles");

    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Unable to create role.",
    };
  }
}

export async function updateRoleAction(
  id: string,
  input: UpdateRoleInput,
): Promise<RoleActionResult> {
  try {
    const data = updateRoleSchema.parse(input);

    await serverApiRequest(`/api/roles/${id}`, {
      method: "PATCH",
      body: data,
      cache: "no-store",
    });

    revalidatePath("/roles");

    revalidatePath(`/roles/${id}`);

    revalidatePath(`/roles/${id}/edit`);

    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Unable to update role.",
    };
  }
}

export async function deleteRoleAction(id: string): Promise<RoleActionResult> {
  try {
    await serverApiRequest(`/api/roles/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    revalidatePath("/roles");

    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Unable to delete role.",
    };
  }
}
