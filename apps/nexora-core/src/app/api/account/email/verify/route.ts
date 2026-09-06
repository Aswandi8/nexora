import { verifyAccountEmailChangeResultSchema } from "@nexora/contracts";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api/api-response";
import { writeSystemAuditLog } from "@/lib/audit";
import { verifyOwnEmailChange } from "@/modules/account";

const verifyEmailChangeInputSchema = z.object({
  token: z.string().trim().min(1).max(256),
});

export async function POST(request: Request) {
  try {
    const { token } = verifyEmailChangeInputSchema.parse(await request.json());
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
