import { PERMISSIONS } from "@nexora/contracts";

import { authenticateAdminRequest, requirePermission } from "@/auth";
import { apiError, apiSuccess } from "@/lib/api/api-response";
import {
  buildAuditChanges,
  getAuditChangedFields,
  writeAuditLog,
} from "@/lib/audit";
import { invalidateDashboardCache } from "@/lib/cache/cache-invalidation";
import {
  deleteShortlink,
  getShortlinkById,
  updateShortlink,
} from "@/modules/shortlinks";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.SHORTLINKS_READ);

    const { id } = await context.params;

    return apiSuccess(await getShortlinkById(id));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    requirePermission(authContext, PERMISSIONS.SHORTLINKS_UPDATE);

    const { id } = await context.params;
    const body = await request.json();

    const { before, result } = await updateShortlink(id, body);

    const changes = buildAuditChanges({
      slug: {
        from: before.slug,
        to: result.slug,
      },
      destinationUrl: {
        from: before.destinationUrl,
        to: result.destinationUrl,
      },
      title: {
        from: before.title,
        to: result.title,
      },
      description: {
        from: before.description,
        to: result.description,
      },
      mediaType: {
        from: before.mediaType,
        to: result.mediaType,
      },
      mediaUrl: {
        from: before.mediaUrl,
        to: result.mediaUrl,
      },
      posterUrl: {
        from: before.posterUrl,
        to: result.posterUrl,
      },
      displayDurationMs: {
        from: before.displayDurationMs,
        to: result.displayDurationMs,
      },
      status: {
        from: before.status,
        to: result.status,
      },
    });

    invalidateDashboardCache();

    await writeAuditLog({
      request,
      actor: authContext,
      action: "UPDATE",
      resource: "SHORTLINK",
      resourceId: id,
      changedFields: getAuditChangedFields(changes),
      metadata: {
        resourceLabel: result.slug,
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
    requirePermission(authContext, PERMISSIONS.SHORTLINKS_DELETE);

    const { id } = await context.params;
    const result = await deleteShortlink(id);

    invalidateDashboardCache();

    await writeAuditLog({
      request,
      actor: authContext,
      action: "DELETE",
      resource: "SHORTLINK",
      resourceId: id,
      metadata: {
        resourceLabel: result.slug,
      },
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
