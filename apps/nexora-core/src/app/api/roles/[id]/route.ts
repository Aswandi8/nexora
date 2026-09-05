import { PERMISSIONS } from "@nexora/contracts";

import { authenticateAdminRequest, requirePermission } from "@/auth";
import { apiError, apiSuccess } from "@/lib/api/api-response";
import {
  buildAuditChanges,
  getAuditChangedFields,
  writeAuditLog,
} from "@/lib/audit";
import { invalidateDashboardCache } from "@/lib/cache/cache-invalidation";
import { deleteRole, getRoleById, updateRole } from "@/modules/roles";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.ROLES_READ);

    const { id } = await context.params;

    return apiSuccess(await getRoleById(id));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.ROLES_UPDATE);

    const body = await request.json();

    if (Object.prototype.hasOwnProperty.call(body, "permissions")) {
      requirePermission(authContext, PERMISSIONS.PERMISSIONS_ASSIGN);
    }

    const { id } = await context.params;
    const { before, result } = await updateRole(id, body);

    const changes = buildAuditChanges({
      name: {
        from: before.name,
        to: result.name,
      },
      code: {
        from: before.code,
        to: result.code,
      },
      description: {
        from: before.description,
        to: result.description,
      },
      permissions: {
        from: before.permissions,
        to: result.permissions,
      },
    });

    await writeAuditLog({
      request,
      actor: authContext,
      action: "UPDATE",
      resource: "ROLE",
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
    requirePermission(authContext, PERMISSIONS.ROLES_DELETE);

    const { id } = await context.params;
    const result = await deleteRole(id);

    invalidateDashboardCache();

    await writeAuditLog({
      request,
      actor: authContext,
      action: "DELETE",
      resource: "ROLE",
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
