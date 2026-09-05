"use server";

import {
  createRoleSchema,
  updateRoleSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
} from "@nexora/contracts";

import { revalidatePath } from "next/cache";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";
import { serverApiRequest } from "@/lib/api/server";

export type RoleActionResult = ActionResult;

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
    return actionFailure(error, "Role tidak dapat dibuat.");
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
    return actionFailure(error, "Role tidak dapat diperbarui.");
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
    return actionFailure(error, "Role tidak dapat dihapus.");
  }
}
