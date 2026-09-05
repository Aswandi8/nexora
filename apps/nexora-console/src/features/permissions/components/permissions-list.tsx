"use client";

import type { PaginationMeta, Permission } from "@nexora/contracts";

import { DataTable } from "@/components/data-table/data-table";

import type {
  DataTableColumn,
  DataTableFilter,
} from "@/components/data-table/data-table.types";

import { SemanticBadge } from "@/components/ui/semantic-badge";

interface PermissionsListProps {
  permissions: Permission[];

  pagination: PaginationMeta;

  resources: string[];
}

function formatResource(resource: string): string {
  return resource
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const columns: DataTableColumn<Permission>[] = [
  {
    id: "permission",

    header: "Permission",

    cell: (permission) => (
      <div className="min-w-0">
        <p className="font-mono text-xs font-medium text-foreground">
          {permission.code}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">{permission.name}</p>
      </div>
    ),
  },

  {
    id: "resource",

    header: "Resource",

    cell: (permission) => {
      const resource = permission.code.split(".", 1)[0] ?? "unknown";

      return (
        <SemanticBadge type="role.custom" label={formatResource(resource)} />
      );
    },
  },

  {
    id: "description",

    header: "Description",

    cell: (permission) => (
      <p className="max-w-xl text-sm text-muted-foreground">
        {permission.description ?? "No description provided."}
      </p>
    ),
  },
];

export function PermissionsList({
  permissions,
  pagination,
  resources,
}: PermissionsListProps) {
  const filters: DataTableFilter[] = [
    {
      param: "resource",

      label: "Resource",

      options: [
        {
          label: "All resources",
          value: "all",
        },

        ...resources.map((resource) => ({
          label: formatResource(resource),

          value: resource,
        })),
      ],
    },
  ];

  return (
    <DataTable
      data={permissions}
      columns={columns}
      pagination={pagination}
      getRowKey={(permission) => permission.id}
      searchPlaceholder="Search permissions..."
      filters={filters}
      pageSizeOptions={[10, 20, 50, 100]}
      emptyTitle="No permissions found"
      emptyDescription="No permissions match the current search or resource filter."
    />
  );
}
