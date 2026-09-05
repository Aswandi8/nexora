"use client";

import type { PaginationMeta, UserListItem } from "@nexora/contracts";

import { Eye, LockKeyhole, Pencil } from "lucide-react";

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

import {
  getRoleBadgeType,
  getUserStatusBadgeType,
} from "@/config/badge.config";

import { DeleteUserButton } from "./delete-user-button";

interface UsersListProps {
  users: UserListItem[];
  pagination: PaginationMeta;
  canUpdate: boolean;
  canDelete: boolean;
}

const columns: DataTableColumn<UserListItem>[] = [
  {
    id: "user",

    header: "User",

    cell: (user) => (
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {user.name}
          </p>

          {user.isSuperAdmin ? (
            <SemanticBadge
              type="generic.protected"
              icon={<LockKeyhole className="size-3" />}
              className="px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
            />
          ) : null}
        </div>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {user.email}
        </p>
      </div>
    ),
  },

  {
    id: "status",

    header: "Status",

    cell: (user) => (
      <SemanticBadge type={getUserStatusBadgeType(user.status)} />
    ),
  },

  {
    id: "role",

    header: "Role",

    cell: (user) => (
      <SemanticBadge
        type={getRoleBadgeType(user.role.code)}
        label={user.role.code}
        className="font-mono text-[11px]"
      />
    ),
  },

  {
    id: "created",

    header: "Created",

    cell: (user) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
        }).format(new Date(user.createdAt))}
      </span>
    ),
  },
];

const filters: DataTableFilter[] = [
  {
    param: "status",

    label: "Account status",

    options: [
      {
        label: "All statuses",
        value: "all",
      },

      {
        label: "Active",
        value: "ACTIVE",
      },

      {
        label: "Inactive",
        value: "INACTIVE",
      },

      {
        label: "Suspended",
        value: "SUSPENDED",
      },
    ],
  },
];

export function UsersList({
  users,
  pagination,
  canUpdate,
  canDelete,
}: UsersListProps) {
  return (
    <DataTable
      data={users}
      columns={columns}
      pagination={pagination}
      getRowKey={(user) => user.id}
      searchPlaceholder="Search users..."
      filters={filters}
      pageSizeOptions={[10, 20, 50, 100]}
      emptyTitle="No users found"
      emptyDescription="No users match the current search or filter."
      renderActions={(user, { isPending, startTransition }) => {
        const showEdit = canUpdate;

        const showDelete = canDelete && !user.isSuperAdmin;

        return (
          <DataTableActions label={`Actions for ${user.name}`}>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}`}>
                <Eye className="size-4" />

                <span>View details</span>
              </Link>
            </DropdownMenuItem>

            {showEdit ? (
              <DropdownMenuItem asChild>
                <Link href={`/users/${user.id}/edit`}>
                  <Pencil className="size-4" />

                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
            ) : null}

            {showDelete ? <DropdownMenuSeparator /> : null}

            {showDelete ? (
              <DeleteUserButton
                id={user.id}
                name={user.name}
                email={user.email}
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
