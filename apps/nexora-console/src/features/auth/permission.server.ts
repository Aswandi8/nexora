import "server-only";

import type { AdminSession } from "@nexora/contracts/auth";

import type { PermissionCode } from "@nexora/contracts/permissions";

import { redirect } from "next/navigation";

import { requireAdminSession } from "@/features/auth/auth.server";

export function hasPermission(
  session: AdminSession,
  permission: PermissionCode,
): boolean {
  return session.permissions.includes(permission);
}

export function hasAnyPermission(
  session: AdminSession,
  permissions: PermissionCode[],
): boolean {
  return permissions.some((permission) => hasPermission(session, permission));
}

export function hasEveryPermission(
  session: AdminSession,
  permissions: PermissionCode[],
): boolean {
  return permissions.every((permission) => hasPermission(session, permission));
}

export async function requirePermission(
  permission: PermissionCode,
): Promise<AdminSession> {
  const session = await requireAdminSession();

  if (!hasPermission(session, permission)) {
    redirect("/forbidden");
  }

  return session;
}

export async function requireAnyPermission(
  permissions: PermissionCode[],
): Promise<AdminSession> {
  const session = await requireAdminSession();

  if (!hasAnyPermission(session, permissions)) {
    redirect("/forbidden");
  }

  return session;
}

export async function requireEveryPermission(
  permissions: PermissionCode[],
): Promise<AdminSession> {
  const session = await requireAdminSession();

  if (!hasEveryPermission(session, permissions)) {
    redirect("/forbidden");
  }

  return session;
}
