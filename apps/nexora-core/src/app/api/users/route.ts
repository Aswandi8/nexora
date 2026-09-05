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

    if (Object.prototype.hasOwnProperty.call(body, "roleId")) {
      requirePermission(authContext, PERMISSIONS.USERS_ASSIGN_ROLE);
    }

    const result = await createUser(body);

    invalidateDashboardCache();

    await writeAuditLog({
      request,
      actor: authContext,
      action: "CREATE",
      resource: "USER",
      resourceId: result.user.id,
      changedFields: ["name", "email", "status", "role"],
      metadata: {
        resourceLabel: result.user.name,
        invitationSent: result.invitationSent,
      },
    });

    return apiSuccess(result, 201);
  } catch (error) {
    return apiError(error);
  }
}
