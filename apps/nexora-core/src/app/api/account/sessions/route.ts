import { accountSessionListSchema } from "@nexora/contracts";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { listOwnSessions } from "@/modules/account";

export async function GET(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const result = await listOwnSessions(
      authContext.user.id,
      authContext.session.id,
    );

    return apiSuccess(accountSessionListSchema.parse(result));
  } catch (error) {
    return apiError(error);
  }
}
