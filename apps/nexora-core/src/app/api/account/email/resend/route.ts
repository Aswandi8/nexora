import { resendAccountEmailChangeResultSchema } from "@nexora/contracts";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { writeAuditLog } from "@/lib/audit";

import { resendOwnEmailChange } from "@/modules/account";

export async function POST(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const result = await resendOwnEmailChange(authContext.user.id);

    await writeAuditLog({
      request,
      actor: authContext,
      action: "UPDATE",
      resource: "USER",
      resourceId: authContext.user.id,
      changedFields: ["pendingEmail"],
      metadata: {
        resourceLabel: authContext.user.name,
        event: "EMAIL_VERIFICATION_RESENT",
        pendingEmail: result.pendingChange.pendingEmail,
      },
    });

    return apiSuccess(resendAccountEmailChangeResultSchema.parse(result));
  } catch (error) {
    return apiError(error);
  }
}
