import type { Metadata } from "next";

import { PERMISSIONS, permissionListQuerySchema } from "@nexora/contracts";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { requirePermission } from "@/features/auth/permission.server";

import { PermissionsList } from "@/features/permissions/components/permissions-list";

import { getPermissionsList } from "@/features/permissions/permissions.server";

export const metadata: Metadata = {
  title: "Permissions",
};

interface PermissionsPageProps {
  searchParams: Promise<{
    page?: string;

    limit?: string;

    search?: string;

    resource?: string;
  }>;
}

export default async function PermissionsPage({
  searchParams,
}: PermissionsPageProps) {
  await requirePermission(PERMISSIONS.PERMISSIONS_READ);

  const params = await searchParams;

  const query = permissionListQuerySchema.parse({
    page: params.page,

    limit: params.limit,

    search: params.search,

    resource: params.resource,
  });

  const permissions = await getPermissionsList(query);

  /*
   * Resource filters come from the permission
   * catalogue itself rather than a duplicated
   * hard-coded UI list.
   *
   * The currently loaded list may be filtered,
   * therefore use the known active Nexora
   * permission constants as the source of
   * resource names.
   */
  const resources = Array.from(
    new Set(
      Object.values(PERMISSIONS).map(
        (permission) => permission.split(".", 1)[0],
      ),
    ),
  ).sort();

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Identity",
          },

          {
            label: "Permissions",
          },
        ]}
        title="Permissions"
        description="Review the system permission catalogue available across Nexora."
      />

      <PermissionsList
        permissions={permissions.items}
        pagination={permissions.pagination}
        resources={resources}
      />
    </div>
  );
}
