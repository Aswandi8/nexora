import { authenticateAdminRequest } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { getDashboardOverview } from "@/modules/dashboard/dashboard.service";

export async function GET(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    const result = await getDashboardOverview(authContext.permissions);

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
