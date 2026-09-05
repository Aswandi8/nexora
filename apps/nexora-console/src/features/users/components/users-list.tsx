"use client";

import type {
  PaginationMeta,
  RoleListItem,
  UserListItem,
} from "@nexora/contracts";
import { Eye, LockKeyhole, Pencil } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

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
import { ResendInvitationButton } from "./resend-invitation-button";
import { UserAccessDialog } from "./user-access-dialog";

interface UsersListProps {
  users: UserListItem[];
  roles: RoleListItem[];
  pagination: PaginationMeta;
  currentUserId: string;
  canUpdate: boolean;
  canAssignRole: boolean;
  canDelete: boolean;
}

interface ActiveDialog {
  mode: "status" | "role";
  user: UserListItem;
}

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
  roles,
  pagination,
  currentUserId,
  canUpdate,
  canAssignRole,
  canDelete,
}: UsersListProps) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null);

  const [mutationPending, startMutationTransition] = useTransition();

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
      id: "verification",
      header: "Email",
      cell: (user) => (
        <SemanticBadge
          type={user.emailVerified ? "verification.verified" : "status.pending"}
          label={user.emailVerified ? "Verified" : "Pending"}
        />
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => {
        const editable =
          canUpdate && !user.isSuperAdmin && user.id !== currentUserId;

        if (!editable) {
          return <SemanticBadge type={getUserStatusBadgeType(user.status)} />;
        }

        return (
          <button
            type="button"
            aria-label={`Ubah status ${user.name}`}
            disabled={mutationPending}
            onClick={() =>
              setActiveDialog({
                mode: "status",
                user,
              })
            }
            className="rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
          >
            <SemanticBadge
              type={getUserStatusBadgeType(user.status)}
              className="cursor-pointer"
            />
          </button>
        );
      },
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => {
        const editable = canUpdate && canAssignRole && !user.isSuperAdmin;

        if (!editable) {
          return (
            <SemanticBadge
              type={getRoleBadgeType(user.role.code)}
              label={user.role.name}
            />
          );
        }

        return (
          <button
            type="button"
            aria-label={`Ubah role ${user.name}`}
            disabled={mutationPending}
            onClick={() =>
              setActiveDialog({
                mode: "role",
                user,
              })
            }
            className="rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
          >
            <SemanticBadge
              type={getRoleBadgeType(user.role.code)}
              label={user.role.name}
              className="cursor-pointer"
            />
          </button>
        );
      },
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

  return (
    <>
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
        externalPending={mutationPending}
        renderActions={(user, { isPending, startTransition }) => {
          const showEdit = canUpdate;

          const showResendInvitation = canUpdate && !user.emailVerified;

          const showDelete =
            canDelete && !user.isSuperAdmin && user.id !== currentUserId;

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

              {showResendInvitation || showDelete ? (
                <DropdownMenuSeparator />
              ) : null}

              {showResendInvitation ? (
                <ResendInvitationButton
                  id={user.id}
                  name={user.name}
                  email={user.email}
                  isPending={isPending}
                  startTransition={startTransition}
                />
              ) : null}

              {showResendInvitation && showDelete ? (
                <DropdownMenuSeparator />
              ) : null}

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

      {activeDialog ? (
        <UserAccessDialog
          key={`${activeDialog.mode}-${activeDialog.user.id}`}
          mode={activeDialog.mode}
          user={activeDialog.user}
          roles={roles}
          open
          pending={mutationPending}
          startTransition={startMutationTransition}
          onOpenChange={(open) => {
            if (!open && !mutationPending) {
              setActiveDialog(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
