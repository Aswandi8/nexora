import type { PermissionCode } from "@nexora/contracts";

import type { AuthenticatedAdmin } from "./authenticate-admin-request";

export function requireAnyPermission(
  authContext: AuthenticatedAdmin,
  permissions: PermissionCode[],
): void {
  if (
    !permissions.some((permission) =>
      authContext.permissions.includes(permission),
    )
  ) {
    throw new Error("FORBIDDEN");
  }
}
