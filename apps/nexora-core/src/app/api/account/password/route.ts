import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { writeAuditLog } from "@/lib/audit";
import { changeOwnPassword } from "@/modules/account";

export async function POST(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const body = await request.json();

    const result = await changeOwnPassword(
      request.headers,
      {
        id: authContext.session.id,
        userId: authContext.user.id,
      },
      body,
    );

    await writeAuditLog({
      request,
      actor: authContext,
      action: "UPDATE",
      resource: "USER",
      resourceId: authContext.user.id,
      changedFields: ["password"],
      metadata: {
        event: "PASSWORD_CHANGED",
      },
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
