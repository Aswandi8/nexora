export const SUPER_ADMIN_ROLE_CODE = "SUPER_ADMIN" as const;

export const SYSTEM_ROLES = [
  SUPER_ADMIN_ROLE_CODE,
  "ADMIN",
  "MANAGER",
  "OPERATOR",
  "VIEWER",
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export function isSystemRoleCode(code: string): code is SystemRole {
  return (SYSTEM_ROLES as readonly string[]).includes(code);
}

export function isSuperAdminRoleCode(code: string): boolean {
  return code === SUPER_ADMIN_ROLE_CODE;
}
