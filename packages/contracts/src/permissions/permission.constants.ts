export const PERMISSIONS = {
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_ASSIGN_ROLE: "users.assign_role",

  ROLES_READ: "roles.read",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",

  PERMISSIONS_READ: "permissions.read",
  PERMISSIONS_ASSIGN: "permissions.assign",

  SHORTLINKS_READ: "shortlinks.read",
  SHORTLINKS_CREATE: "shortlinks.create",
  SHORTLINKS_UPDATE: "shortlinks.update",
  SHORTLINKS_DELETE: "shortlinks.delete",

  AUDIT_READ: "audit.read",

  API_CLIENTS_READ: "api_clients.read",
  API_CLIENTS_CREATE: "api_clients.create",
  API_CLIENTS_ROTATE: "api_clients.rotate",
  API_CLIENTS_REVOKE: "api_clients.revoke",
} as const;

export const PERMISSION_VALUES = Object.values(PERMISSIONS);

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
