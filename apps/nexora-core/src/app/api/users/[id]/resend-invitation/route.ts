import { PERMISSIONS } from "@nexora/contracts";

import { authenticateAdminRequest, requirePermission } from "@/auth";
import { apiError, apiSuccess } from "@/lib/api/api-response";
import { writeAuditLog } from "@/lib/audit";
import { resendUserInvitation } from "@/modules/users";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    requirePermission(authContext, PERMISSIONS.USERS_UPDATE);

    const { id } = await context.params;

    const user = await resendUserInvitation(id);

    await writeAuditLog({
      request,
      actor: authContext,
      action: "UPDATE",
      resource: "USER",
      resourceId: user.id,
      changedFields: ["invitation"],
      metadata: {
        resourceLabel: user.name,
        event: "RESEND_INVITATION",
        invitationSent: true,
        emailVerified: user.emailVerified,
      },
    });

    return apiSuccess({
      sent: true,
    });
  } catch (error) {
    return apiError(error);
  }
}
