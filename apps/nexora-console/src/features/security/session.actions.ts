"use server";

import {
  accountSessionListSchema,
  logoutAllSessionsResultSchema,
  logoutOtherSessionsResultSchema,
  revokeAccountSessionResultSchema,
  type AccountSession,
} from "@nexora/contracts";

import { actionFailure, type ActionResult } from "@/lib/actions/action-result";

import { serverApiRequest } from "@/lib/api/server";

export async function getSessions(): Promise<AccountSession[]> {
  const response = await serverApiRequest("/api/account/sessions", {
    cache: "no-store",
  });

  return accountSessionListSchema.parse(response).sessions;
}

export async function revokeSessionAction(
  sessionId: string,
): Promise<ActionResult> {
  try {
    const response = await serverApiRequest(
      `/api/account/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: "DELETE",
        cache: "no-store",
      },
    );

    const result = revokeAccountSessionResultSchema.parse(response);

    if (!result.revoked) {
      return {
        success: false,
        message: "Session tidak dapat dikeluarkan.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return actionFailure(error, "Session tidak dapat dikeluarkan.");
  }
}

export interface LogoutOtherSessionsActionResult extends ActionResult {
  revokedCount?: number;
}

export async function logoutOtherSessionsAction(): Promise<LogoutOtherSessionsActionResult> {
  try {
    const response = await serverApiRequest(
      "/api/account/sessions/logout-others",
      {
        method: "POST",
        cache: "no-store",
      },
    );

    const result = logoutOtherSessionsResultSchema.parse(response);

    return {
      success: true,
      revokedCount: result.revokedCount,
    };
  } catch (error) {
    return actionFailure<LogoutOtherSessionsActionResult>(
      error,
      "Session lain tidak dapat dikeluarkan.",
    );
  }
}

export interface LogoutAllSessionsActionResult extends ActionResult {
  revokedCount?: number;
}

export async function logoutAllSessionsAction(): Promise<LogoutAllSessionsActionResult> {
  try {
    const response = await serverApiRequest(
      "/api/account/sessions/logout-all",
      {
        method: "POST",
        cache: "no-store",
      },
    );

    const result = logoutAllSessionsResultSchema.parse(response);

    return {
      success: true,
      revokedCount: result.revokedCount,
    };
  } catch (error) {
    return actionFailure<LogoutAllSessionsActionResult>(
      error,
      "Semua session tidak dapat dikeluarkan.",
    );
  }
}
