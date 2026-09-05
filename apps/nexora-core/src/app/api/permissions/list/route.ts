import { PERMISSIONS } from "@nexora/contracts";

import { authenticateAdminRequest, requirePermission } from "@/auth";

import { apiError, apiSuccess } from "@/lib/api/api-response";

import { listPermissionsPaginated } from "@/modules/permissions";

export async function GET(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);

    requirePermission(authContext, PERMISSIONS.PERMISSIONS_READ);

    const url = new URL(request.url);

    const result = await listPermissionsPaginated({
      page: url.searchParams.get("page") ?? undefined,

      limit: url.searchParams.get("limit") ?? undefined,

      search: url.searchParams.get("search") ?? undefined,

      resource: url.searchParams.get("resource") ?? undefined,
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
