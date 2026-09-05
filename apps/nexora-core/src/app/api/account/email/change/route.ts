import {
  requestAccountEmailChangeResultSchema,
  requestAccountEmailChangeSchema,
} from "@nexora/contracts";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { writeAuditLog } from "@/lib/audit";

import { requestOwnEmailChange } from "@/modules/account";

export async function POST(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const body = requestAccountEmailChangeSchema.parse(await request.json());

    const result = await requestOwnEmailChange(
      request.headers,
      authContext.user.id,
      authContext.user.email,
      authContext.user.name,
      body,
    );

    await writeAuditLog({
      request,
      actor: authContext,
      action: "UPDATE",
      resource: "USER",
      resourceId: authContext.user.id,
      changedFields: ["pendingEmail"],
      metadata: {
        resourceLabel: authContext.user.name,
        event: "EMAIL_CHANGE_REQUESTED",
        pendingEmail: result.pendingChange.pendingEmail,
      },
    });

    return apiSuccess(requestAccountEmailChangeResultSchema.parse(result));
  } catch (error) {
    return apiError(error);
  }
}
