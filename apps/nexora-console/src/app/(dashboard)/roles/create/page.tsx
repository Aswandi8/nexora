import type { Metadata } from "next";

import { PERMISSIONS } from "@nexora/contracts";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";

import { RoleForm } from "@/features/roles/components/role-form";

import { getPermissions } from "@/features/roles/roles.server";

export const metadata: Metadata = {
  title: "Create Role",
};

export default async function CreateRolePage() {
  const session = await requirePermission(PERMISSIONS.ROLES_CREATE);

  const canAssignPermissions = hasPermission(
    session,
    PERMISSIONS.PERMISSIONS_ASSIGN,
  );

  const canReadPermissions = hasPermission(
    session,
    PERMISSIONS.PERMISSIONS_READ,
  );

  const permissions =
    canAssignPermissions && canReadPermissions ? await getPermissions() : [];

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Identity",
          },
          {
            label: "Roles",
            href: "/roles",
          },
          {
            label: "Create",
          },
        ]}
        title="Create role"
        description="Create a new access profile for Nexora."
      />

      <RoleForm
        permissions={permissions}
        canAssignPermissions={canAssignPermissions && canReadPermissions}
      />
    </div>
  );
}
