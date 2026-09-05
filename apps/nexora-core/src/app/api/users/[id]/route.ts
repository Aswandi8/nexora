import { PERMISSIONS } from "@nexora/contracts";

import { authenticateAdminRequest, requirePermission } from "@/auth";
import { apiError, apiSuccess } from "@/lib/api/api-response";
import {
  buildAuditChanges,
  getAuditChangedFields,
  writeAuditLog,
} from "@/lib/audit";
import { invalidateDashboardCache } from "@/lib/cache/cache-invalidation";
import { deleteUser, getUserById, updateUser } from "@/modules/users";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.USERS_READ);

    const { id } = await context.params;

    return apiSuccess(await getUserById(id));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.USERS_UPDATE);

    const { id } = await context.params;
    const body = await request.json();

    if (Object.prototype.hasOwnProperty.call(body, "roleId")) {
      requirePermission(authContext, PERMISSIONS.USERS_ASSIGN_ROLE);
    }

    const { before, result } = await updateUser(id, body, authContext.user.id);

    const changes = buildAuditChanges({
      name: {
        from: before.name,
        to: result.name,
      },
      email: {
        from: before.email,
        to: result.email,
      },
      status: {
        from: before.status,
        to: result.status,
      },
      role: {
        from: before.role.code,
        to: result.role.code,
      },
    });

    await writeAuditLog({
      request,
      actor: authContext,
      action: "UPDATE",
      resource: "USER",
      resourceId: id,
      changedFields: getAuditChangedFields(changes),
      metadata: {
        resourceLabel: result.name,
        changes,
      },
    });

    invalidateDashboardCache();

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.USERS_DELETE);

    const { id } = await context.params;

    const result = await deleteUser(id, authContext.user.id);

    invalidateDashboardCache();

    await writeAuditLog({
      request,
      actor: authContext,
      action: "DELETE",
      resource: "USER",
      resourceId: id,
      metadata: {
        resourceLabel: result.name,
      },
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
