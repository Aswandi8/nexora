import { cancelAccountEmailChangeResultSchema } from "@nexora/contracts";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { writeAuditLog } from "@/lib/audit";

import { cancelOwnEmailChange } from "@/modules/account";

export async function DELETE(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const result = await cancelOwnEmailChange(authContext.user.id);

    if (result.cancelled) {
      await writeAuditLog({
        request,
        actor: authContext,
        action: "UPDATE",
        resource: "USER",
        resourceId: authContext.user.id,
        changedFields: ["pendingEmail"],
        metadata: {
          resourceLabel: authContext.user.name,
          event: "EMAIL_CHANGE_CANCELLED",
        },
      });
    }

    return apiSuccess(cancelAccountEmailChangeResultSchema.parse(result));
  } catch (error) {
    return apiError(error);
  }
}
