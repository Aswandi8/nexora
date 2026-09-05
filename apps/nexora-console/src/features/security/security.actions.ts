"use server";

import {
  changeAccountPasswordResultSchema,
  changeAccountPasswordSchema,
  type ChangeAccountPasswordInput,
} from "@nexora/contracts";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";

import { serverApiRequest } from "@/lib/api/server";

export type ChangePasswordActionResult = ActionResult;

export async function changePasswordAction(
  input: ChangeAccountPasswordInput,
): Promise<ChangePasswordActionResult> {
  try {
    const data = changeAccountPasswordSchema.parse(input);

    const response = await serverApiRequest("/api/account/password", {
      method: "POST",
      body: data,
      cache: "no-store",
    });

    changeAccountPasswordResultSchema.parse(response);

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(
      error,
      "Password tidak dapat diubah. Silakan coba lagi.",
    );
  }
}
