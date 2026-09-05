import { PERMISSIONS } from "@nexora/contracts";

import { authenticateAdminRequest, requirePermission } from "@/auth";
import { apiError, apiSuccess } from "@/lib/api/api-response";
import { writeAuditLog } from "@/lib/audit";
import { invalidateDashboardCache } from "@/lib/cache/cache-invalidation";
import { createRole, listRoles } from "@/modules/roles";

export async function GET(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.ROLES_READ);

    const url = new URL(request.url);
    const result = await listRoles({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.ROLES_CREATE);

    const body = await request.json();

    if (Array.isArray(body?.permissions) && body.permissions.length > 0) {
      requirePermission(authContext, PERMISSIONS.PERMISSIONS_ASSIGN);
    }

    const result = await createRole(body);

    invalidateDashboardCache();

    await writeAuditLog({
      request,
      actor: authContext,
      action: "CREATE",
      resource: "ROLE",
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
