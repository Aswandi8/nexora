import { verifyAccountEmailChangeResultSchema } from "@nexora/contracts";

import { apiError, apiSuccess } from "@/lib/api/api-response";
import { writeSystemAuditLog } from "@/lib/audit";
import { verifyOwnEmailChange } from "@/modules/account";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      throw new Error("EMAIL_CHANGE_TOKEN_INVALID");
    }

    const result = await verifyOwnEmailChange(token);

    await writeSystemAuditLog({
      request,
      actor: {
        userId: result.audit.userId,
        name: result.audit.name,
        email: result.email,
      },
      action: "UPDATE",
      resource: "USER",
      resourceId: result.audit.userId,
      changedFields: ["email", "emailVerified"],
      metadata: {
        resourceLabel: result.audit.name,
        event: "EMAIL_CHANGE_VERIFIED",
        previousEmail: result.audit.previousEmail,
        newEmail: result.email,
        sessionsRevoked: true,
      },
    });

    return apiSuccess(
      verifyAccountEmailChangeResultSchema.parse({
        verified: result.verified,
        email: result.email,
      }),
    );
  } catch (error) {
    return apiError(error);
  }
}
