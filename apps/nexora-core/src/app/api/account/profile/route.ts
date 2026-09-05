import { authenticateAdminRequest } from "@/auth";
import { apiError, apiSuccess } from "@/lib/api/api-response";
import {
  buildAuditChanges,
  getAuditChangedFields,
  writeAuditLog,
} from "@/lib/audit";
import { updateOwnProfile } from "@/modules/account";

export async function PATCH(request: Request) {
  try {
    const authContext = await authenticateAdminRequest(request.headers);
    const body = await request.json();

    const { before, result } = await updateOwnProfile(
      authContext.user.id,
      authContext.user.name,
      body,
    );

    const changes = buildAuditChanges({
      name: {
        from: before.name,
        to: result.name,
      },
    });

    const changedFields = getAuditChangedFields(changes);

    if (changedFields.length > 0) {
      await writeAuditLog({
        request,
        actor: authContext,
        action: "UPDATE",
        resource: "USER",
        resourceId: authContext.user.id,
        changedFields,
        metadata: {
          event: "PROFILE_UPDATED",
          resourceLabel: result.name,
          changes,
        },
      });
    }

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
