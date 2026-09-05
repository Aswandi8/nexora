import { accountEmailSecuritySchema } from "@nexora/contracts";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { getOwnEmailSecurity } from "@/modules/account";

export async function GET(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const result = await getOwnEmailSecurity(authContext.user.id);

    return apiSuccess(accountEmailSecuritySchema.parse(result));
  } catch (error) {
    return apiError(error);
  }
}
