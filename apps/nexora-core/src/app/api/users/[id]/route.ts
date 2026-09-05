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

    const { before, result } = await updateUser(id, body);

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
      roleId: {
        from: before.role.id,
        to: result.role.id,
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
    const result = await deleteUser(id);

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
