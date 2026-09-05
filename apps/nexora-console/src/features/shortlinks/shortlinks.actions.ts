"use server";

import {
  createShortlinkSchema,
  shortlinkStatusSchema,
  updateShortlinkSchema,
  type CreateShortlinkInput,
  type UpdateShortlinkInput,
} from "@nexora/contracts";

import { revalidatePath } from "next/cache";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";

import { serverApiRequest } from "@/lib/api/server";

export type ShortlinkActionResult = ActionResult;

export async function createShortlinkAction(
  input: CreateShortlinkInput,
): Promise<ShortlinkActionResult> {
  try {
    const data = createShortlinkSchema.parse(input);

    await serverApiRequest("/api/shortlinks", {
      method: "POST",
      body: data,
      cache: "no-store",
    });

    revalidatePath("/shortlinks");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to create shortlink.");
  }
}

export async function updateShortlinkAction(
  id: string,
  input: UpdateShortlinkInput,
): Promise<ShortlinkActionResult> {
  try {
    const data = updateShortlinkSchema.parse(input);

    await serverApiRequest(`/api/shortlinks/${id}`, {
      method: "PATCH",
      body: data,
      cache: "no-store",
    });

    revalidatePath("/shortlinks");
    revalidatePath(`/shortlinks/${id}`);
    revalidatePath(`/shortlinks/${id}/edit`);
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to update shortlink.");
  }
}

export async function updateShortlinkStatusAction(
  id: string,
  status: unknown,
): Promise<ShortlinkActionResult> {
  try {
    const parsedStatus = shortlinkStatusSchema.parse(status);

    const data = updateShortlinkSchema.parse({
      status: parsedStatus,
    });

    await serverApiRequest(`/api/shortlinks/${id}`, {
      method: "PATCH",
      body: data,
      cache: "no-store",
    });

    revalidatePath("/shortlinks");
    revalidatePath(`/shortlinks/${id}`);
    revalidatePath(`/shortlinks/${id}/edit`);
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to update shortlink status.");
  }
}

export async function deleteShortlinkAction(
  id: string,
): Promise<ShortlinkActionResult> {
  try {
    await serverApiRequest(`/api/shortlinks/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    revalidatePath("/shortlinks");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Unable to delete shortlink.");
  }
}
