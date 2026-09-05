import { adminSessionSchema } from "@nexora/contracts/auth";

import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

export async function GET(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const result = adminSessionSchema.parse(authContext);

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
