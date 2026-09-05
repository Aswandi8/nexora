import { PERMISSIONS } from "@nexora/contracts";

import { authenticateAdminRequest, requirePermission } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { listPermissions } from "@/modules/permissions";

export async function GET(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    requirePermission(authContext, PERMISSIONS.PERMISSIONS_READ);

    const result = await listPermissions();

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
