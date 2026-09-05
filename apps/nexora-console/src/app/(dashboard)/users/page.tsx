import type { Metadata } from "next";

import { PERMISSIONS, userListQuerySchema } from "@nexora/contracts";
import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeaderCard } from "@/components/layout/page-header-card";
import { buttonVariants } from "@/components/ui/button";
import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";
import { UsersList } from "@/features/users/components/users-list";
import { getUserRoleOptions, getUsers } from "@/features/users/users.server";

export const metadata: Metadata = {
  title: "Users",
};

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await requirePermission(PERMISSIONS.USERS_READ);
  const params = await searchParams;

  const query = userListQuerySchema.parse({
    page: params.page,
    limit: params.limit,
    search: params.search,
    status: params.status,
  });

  const canCreate = hasPermission(session, PERMISSIONS.USERS_CREATE);
  const canUpdate = hasPermission(session, PERMISSIONS.USERS_UPDATE);
  const canAssignRole = hasPermission(session, PERMISSIONS.USERS_ASSIGN_ROLE);
  const canDelete = hasPermission(session, PERMISSIONS.USERS_DELETE);

  const [users, roles] = await Promise.all([
    getUsers(query),
    canAssignRole ? getUserRoleOptions() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[{ label: "Identity" }, { label: "Users" }]}
        title="Users"
        description="Manage users and their access to Nexora."
        actions={
          canCreate ? (
            <Link
              href="/users/create"
              className={buttonVariants({ size: "sm" })}
            >
              <Plus className="size-4" />
              Create user
            </Link>
          ) : undefined
        }
      />

      <UsersList
        users={users.items}
        roles={roles}
        pagination={users.pagination}
        currentUserId={session.user.id}
        canUpdate={canUpdate}
        canAssignRole={canAssignRole}
        canDelete={canDelete}
      />
    </div>
  );
}
