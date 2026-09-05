import type { Metadata } from "next";

import { PERMISSIONS } from "@nexora/contracts";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";

import { RoleForm } from "@/features/roles/components/role-form";

import { getPermissions, getRole } from "@/features/roles/roles.server";

export const metadata: Metadata = {
  title: "Edit Role",
};

interface EditRolePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const session = await requirePermission(PERMISSIONS.ROLES_UPDATE);

  const { id } = await params;

  const canAssignPermissions = hasPermission(
    session,
    PERMISSIONS.PERMISSIONS_ASSIGN,
  );

  const canReadPermissions = hasPermission(
    session,
    PERMISSIONS.PERMISSIONS_READ,
  );

  const [role, permissions] = await Promise.all([
    getRole(id),

    canAssignPermissions && canReadPermissions
      ? getPermissions()
      : Promise.resolve([]),
  ]);

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
            label: role.name,
          },
        ]}
        title={`Edit ${role.name}`}
        description="Update role details and access permissions."
      />

      <RoleForm
        role={role}
        permissions={permissions}
        canAssignPermissions={canAssignPermissions && canReadPermissions}
      />
    </div>
  );
}
