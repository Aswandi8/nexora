import type { PermissionCode } from "@nexora/contracts";

import type { AuthenticatedAdmin } from "./authenticate-admin-request";

export function requirePermission(
  authContext: AuthenticatedAdmin,
  permission: PermissionCode,
): void {
  if (!authContext.permissions.includes(permission)) {
    throw new Error("FORBIDDEN");
  }
}
