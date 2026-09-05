"use server";

import {
  updateAccountProfileResultSchema,
  updateAccountProfileSchema,
  type UpdateAccountProfileInput,
} from "@nexora/contracts";

import { revalidatePath } from "next/cache";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";

import { serverApiRequest } from "@/lib/api/server";

export interface UpdateProfileActionResult extends ActionResult {
  name?: string;
}

export async function updateProfileAction(
  input: UpdateAccountProfileInput,
): Promise<UpdateProfileActionResult> {
  try {
    const data = updateAccountProfileSchema.parse(input);

    const response = await serverApiRequest("/api/account/profile", {
      method: "PATCH",
      body: data,
      cache: "no-store",
    });

    const result = updateAccountProfileResultSchema.parse(response);

    revalidatePath("/profile");
    revalidatePath("/", "layout");

    return {
      success: true,
      name: result.name,
    };
  } catch (error) {
    return actionFailure<UpdateProfileActionResult>(
      error,
      "Profil tidak dapat diperbarui. Silakan coba lagi.",
    );
  }
}
