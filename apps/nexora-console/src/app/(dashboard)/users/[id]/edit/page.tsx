import type { Metadata } from "next";

import { PERMISSIONS } from "@nexora/contracts";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import {
  hasPermission,
  requireEveryPermission,
} from "@/features/auth/permission.server";

import { UserForm } from "@/features/users/components/user-form";

import { getUser, getUserRoleOptions } from "@/features/users/users.server";

export const metadata: Metadata = {
  title: "Edit User",
};

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await requireEveryPermission([
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
  ]);

  const { id } = await params;

  const canReadRoles = hasPermission(session, PERMISSIONS.ROLES_READ);

  const [user, roles] = await Promise.all([
    getUser(id),

    canReadRoles ? getUserRoleOptions() : Promise.resolve([]),
  ]);

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
            label: user.name,
          },
        ]}
        title={`Edit ${user.name}`}
        description="Update user identity, account status, and access role."
      />

      <UserForm user={user} roles={roles} canManageRoles={canReadRoles} />
    </div>
  );
}
