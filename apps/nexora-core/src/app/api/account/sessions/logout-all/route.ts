import { logoutAllSessionsResultSchema } from "@nexora/contracts";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { writeAuditLog } from "@/lib/audit";

import { logoutOwnAllSessions } from "@/modules/account";

export async function POST(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    await writeAuditLog({
      request,
      actor: authContext,
      action: "UPDATE",
      resource: "USER",
      resourceId: authContext.user.id,
      changedFields: ["sessions"],
      metadata: {
        event: "ALL_SESSIONS_REVOKED",
      },
    });

    const result = await logoutOwnAllSessions(authContext.user.id);

    return apiSuccess(logoutAllSessionsResultSchema.parse(result));
  } catch (error) {
    return apiError(error);
  }
}
