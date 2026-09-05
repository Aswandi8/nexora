import { logoutOtherSessionsResultSchema } from "@nexora/contracts";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { writeAuditLog } from "@/lib/audit";

import { logoutOwnOtherSessions } from "@/modules/account";

export async function POST(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const result = await logoutOwnOtherSessions(
      authContext.user.id,
      authContext.session.id,
    );

    if (result.revokedCount > 0) {
      await writeAuditLog({
        request,
        actor: authContext,
        action: "UPDATE",
        resource: "USER",
        resourceId: authContext.user.id,
        changedFields: ["sessions"],
        metadata: {
          event: "OTHER_SESSIONS_REVOKED",
          revokedCount: result.revokedCount,
        },
      });
    }

    return apiSuccess(logoutOtherSessionsResultSchema.parse(result));
  } catch (error) {
    return apiError(error);
  }
}
