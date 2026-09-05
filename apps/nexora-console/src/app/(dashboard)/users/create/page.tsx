import type { Metadata } from "next";

import { PERMISSIONS } from "@nexora/contracts";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";

import { UserForm } from "@/features/users/components/user-form";

import { getUserRoleOptions } from "@/features/users/users.server";

export const metadata: Metadata = {
  title: "Create User",
};

export default async function CreateUserPage() {
  const session = await requirePermission(PERMISSIONS.USERS_CREATE);

  const canReadRoles = hasPermission(session, PERMISSIONS.ROLES_READ);

  const roles = canReadRoles ? await getUserRoleOptions() : [];

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Identity",
          },
          {
            label: "Users",
            href: "/users",
          },
          {
            label: "Create",
          },
        ]}
        title="Create user"
        description="Create a new Nexora user account and assign its access role."
      />

      <UserForm roles={roles} canManageRoles={canReadRoles} />
    </div>
  );
}
