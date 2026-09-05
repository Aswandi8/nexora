"use client";

import {
  SUPER_ADMIN_ROLE_CODE,
  type PaginationMeta,
  type RoleListItem,
} from "@nexora/contracts";

import { Eye, Pencil } from "lucide-react";

import Link from "next/link";

import { DataTable } from "@/components/data-table/data-table";

import { DataTableActions } from "@/components/data-table/data-table-actions";

import type {
  DataTableColumn,
  DataTableFilter,
} from "@/components/data-table/data-table.types";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { SemanticBadge } from "@/components/ui/semantic-badge";

import { getRoleBadgeType, getRoleTypeBadgeType } from "@/config/badge.config";

import { DeleteRoleButton } from "./delete-role-button";

interface RolesListProps {
  roles: RoleListItem[];
  pagination: PaginationMeta;
  canUpdate: boolean;
  canDelete: boolean;
}

const columns: DataTableColumn<RoleListItem>[] = [
  {
    id: "role",

    header: "Role",

    cell: (role) => (
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">{role.name}</p>

          <SemanticBadge
            type={getRoleBadgeType(role.code)}
            label={role.code}
            className="font-mono text-[10px]"
          />

          {role.code === SUPER_ADMIN_ROLE_CODE ? (
            <SemanticBadge
              type="generic.protected"
              className="px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
            />
          ) : null}
        </div>

        {role.description ? (
          <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
            {role.description}
          </p>
        ) : null}
      </div>
    ),
  },

  {
    id: "type",

    header: "Type",

    cell: (role) => (
      <SemanticBadge type={getRoleTypeBadgeType(role.isSystem)} />
    ),
  },

  {
    id: "users",

    header: "Users",

    headerClassName: "text-center",

    className: "text-center text-sm text-foreground",

    cell: (role) => role.userCount,
  },

  {
    id: "permissions",

    header: "Permissions",

    headerClassName: "text-center",

    className: "text-center text-sm text-foreground",

    cell: (role) => role.permissionCount,
  },
];

const filters: DataTableFilter[] = [
  {
    param: "type",

    label: "Role type",

    options: [
      {
        label: "All types",
        value: "all",
      },

      {
        label: "System",
        value: "system",
      },

      {
        label: "Custom",
        value: "custom",
      },
    ],
  },
];

export function RolesList({
  roles,
  pagination,
  canUpdate,
  canDelete,
}: RolesListProps) {
  return (
    <DataTable
      data={roles}
      columns={columns}
      pagination={pagination}
      getRowKey={(role) => role.id}
      searchPlaceholder="Search roles..."
      filters={filters}
      pageSizeOptions={[10, 20, 50, 100]}
      emptyTitle="No roles found"
      emptyDescription="No roles match the current search or filter."
      renderActions={(role, { isPending, startTransition }) => {
        const isSuperAdmin = role.code === SUPER_ADMIN_ROLE_CODE;

        const showEdit = canUpdate && !isSuperAdmin;

        const showDelete = canDelete && !role.isSystem;

        return (
          <DataTableActions label={`Actions for ${role.name}`}>
            <DropdownMenuItem asChild>
              <Link href={`/roles/${role.id}`}>
                <Eye className="size-4" />

                <span>View details</span>
              </Link>
            </DropdownMenuItem>

            {showEdit ? (
              <DropdownMenuItem asChild>
                <Link href={`/roles/${role.id}/edit`}>
                  <Pencil className="size-4" />

                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
            ) : null}

            {showDelete ? <DropdownMenuSeparator /> : null}

            {showDelete ? (
              <DeleteRoleButton
                id={role.id}
                name={role.name}
                code={role.code}
                isPending={isPending}
                startTransition={startTransition}
              />
            ) : null}
          </DataTableActions>
        );
      }}
    />
  );
}
