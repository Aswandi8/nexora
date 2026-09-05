import type { Metadata } from "next";

import { PERMISSIONS, roleListQuerySchema } from "@nexora/contracts";

import { Plus } from "lucide-react";

import Link from "next/link";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { buttonVariants } from "@/components/ui/button";

import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";

import { RolesList } from "@/features/roles/components/roles-list";

import { getRoles } from "@/features/roles/roles.server";

export const metadata: Metadata = {
  title: "Roles",
};

interface RolesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    type?: string;
  }>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const session = await requirePermission(PERMISSIONS.ROLES_READ);

  const params = await searchParams;

  const query = roleListQuerySchema.parse({
    page: params.page,
    limit: params.limit,
    search: params.search,
    type: params.type,
  });

  const roles = await getRoles(query);

  const canCreate = hasPermission(session, PERMISSIONS.ROLES_CREATE);

  const canUpdate = hasPermission(session, PERMISSIONS.ROLES_UPDATE);

  const canDelete = hasPermission(session, PERMISSIONS.ROLES_DELETE);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Identity",
          },
          {
            label: "Roles",
          },
        ]}
        title="Roles"
        description="Define and manage roles within Nexora."
        actions={
          canCreate ? (
            <Link
              href="/roles/create"
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Plus className="size-4" />
              Create role
            </Link>
          ) : undefined
        }
      />

      <RolesList
        roles={roles.items}
        pagination={roles.pagination}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
