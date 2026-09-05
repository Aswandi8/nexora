import { revokeAccountSessionResultSchema } from "@nexora/contracts";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { writeAuditLog } from "@/lib/audit";

import { revokeOwnSession } from "@/modules/account";

interface RouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const { sessionId } = await context.params;

    const result = await revokeOwnSession(
      authContext.user.id,
      authContext.session.id,
      sessionId,
    );

    if (result.revoked) {
      await writeAuditLog({
        request,
        actor: authContext,
        action: "UPDATE",
        resource: "USER",
        resourceId: authContext.user.id,
        changedFields: ["sessions"],
        metadata: {
          event: "SESSION_REVOKED",
        },
      });
    }

    return apiSuccess(revokeAccountSessionResultSchema.parse(result));
  } catch (error) {
    return apiError(error);
  }
}
