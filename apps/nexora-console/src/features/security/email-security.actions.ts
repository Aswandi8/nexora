"use server";

import {
  cancelAccountEmailChangeResultSchema,
  requestAccountEmailChangeResultSchema,
  requestAccountEmailChangeSchema,
  resendAccountEmailChangeResultSchema,
  type RequestAccountEmailChangeInput,
} from "@nexora/contracts";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";

import { serverApiRequest } from "@/lib/api/server";

export interface RequestEmailChangeActionResult extends ActionResult {
  pendingEmail?: string;
  expiresAt?: string;
}

export interface ResendEmailChangeActionResult extends ActionResult {
  pendingEmail?: string;
  expiresAt?: string;
}

export interface CancelEmailChangeActionResult extends ActionResult {
  cancelled?: boolean;
}

export async function requestEmailChangeAction(
  input: RequestAccountEmailChangeInput,
): Promise<RequestEmailChangeActionResult> {
  try {
    const body = requestAccountEmailChangeSchema.parse(input);

    const result = await serverApiRequest("/api/account/email/change", {
      method: "POST",
      body,
      cache: "no-store",
    });

    const parsed = requestAccountEmailChangeResultSchema.parse(result);

    return {
      success: true,
      pendingEmail: parsed.pendingChange.pendingEmail,
      expiresAt: parsed.pendingChange.expiresAt,
    };
  } catch (error) {
    return actionFailure<RequestEmailChangeActionResult>(
      error,
      "Perubahan email tidak dapat diproses.",
    );
  }
}

export async function resendEmailChangeAction(): Promise<ResendEmailChangeActionResult> {
  try {
    const result = await serverApiRequest("/api/account/email/resend", {
      method: "POST",
      cache: "no-store",
    });

    const parsed = resendAccountEmailChangeResultSchema.parse(result);

    return {
      success: true,
      pendingEmail: parsed.pendingChange.pendingEmail,
      expiresAt: parsed.pendingChange.expiresAt,
    };
  } catch (error) {
    return actionFailure<ResendEmailChangeActionResult>(
      error,
      "Email verifikasi tidak dapat dikirim ulang.",
    );
  }
}

export async function cancelEmailChangeAction(): Promise<CancelEmailChangeActionResult> {
  try {
    const result = await serverApiRequest("/api/account/email/pending", {
      method: "DELETE",
      cache: "no-store",
    });

    const parsed = cancelAccountEmailChangeResultSchema.parse(result);

    return {
      success: true,
      cancelled: parsed.cancelled,
    };
  } catch (error) {
    return actionFailure<CancelEmailChangeActionResult>(
      error,
      "Perubahan email tidak dapat dibatalkan.",
    );
  }
}
