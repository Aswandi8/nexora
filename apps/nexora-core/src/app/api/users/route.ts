import { PERMISSIONS } from "@nexora/contracts";

import { authenticateAdminRequest, requirePermission } from "@/auth";
import { apiError, apiSuccess } from "@/lib/api/api-response";
import { writeAuditLog } from "@/lib/audit";
import { invalidateDashboardCache } from "@/lib/cache/cache-invalidation";
import { createUser, listUsers } from "@/modules/users";

export async function GET(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.USERS_READ);

    const url = new URL(request.url);
    const result = await listUsers({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.USERS_CREATE);

    const body = await request.json();
    const result = await createUser(body);

    invalidateDashboardCache();

    await writeAuditLog({
      request,
      actor: authContext,
      action: "CREATE",
      resource: "USER",
      resourceId: result.id,
      changedFields: Object.keys(body ?? {}),
      metadata: {
        resourceLabel: result.name,
      },
    });

    return apiSuccess(result, 201);
  } catch (error) {
    return apiError(error);
  }
}
