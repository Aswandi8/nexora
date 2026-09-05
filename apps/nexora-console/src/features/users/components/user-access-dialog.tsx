"use client";

import {
  SUPER_ADMIN_ROLE_CODE,
  type RoleListItem,
  type UserListItem,
} from "@nexora/contracts";
import { useState } from "react";

import {
  SelectionDialog,
  type SelectionDialogOption,
} from "@/components/ui/selection-dialog";
import { SemanticBadge } from "@/components/ui/semantic-badge";
import {
  getRoleBadgeType,
  getUserStatusBadgeType,
} from "@/config/badge.config";
import { useToast } from "@/hooks/use-toast";

import { updateUserRoleAction, updateUserStatusAction } from "../users.actions";

type UserAccessDialogMode = "status" | "role";
type UserStatus = UserListItem["status"];
type StartTransition = (action: () => void | Promise<void>) => void;

interface UserAccessDialogProps {
  mode: UserAccessDialogMode;
  user: UserListItem;
  roles: RoleListItem[];
  open: boolean;
  pending: boolean;
  startTransition: StartTransition;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: SelectionDialogOption<UserStatus>[] = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Akun aktif dan dapat menggunakan Nexora.",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    description: "Akun dinonaktifkan dan tidak dapat digunakan.",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
    description: "Akun dibekukan sementara untuk alasan administratif.",
  },
];

export function UserAccessDialog({
  mode,
  user,
  roles,
  open,
  pending,
  startTransition,
  onOpenChange,
}: UserAccessDialogProps) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<UserStatus>(user.status);
  const [currentRoleId, setCurrentRoleId] = useState(user.role.id);

  const assignableRoles = roles.filter(
    (role) => role.code !== SUPER_ADMIN_ROLE_CODE,
  );

  const roleOptions: SelectionDialogOption<string>[] = assignableRoles.map(
    (role) => ({
      value: role.id,
      label: role.name,
      description:
        role.description?.trim() ||
        `Hak akses mengikuti permission role ${role.name}.`,
    }),
  );

  function handleStatusSubmit(status: UserStatus) {
    startTransition(async () => {
      const result = await updateUserStatusAction(user.id, status);

      if (!result.success) {
        toast({
          title: "Status update failed",
          description: result.message ?? "Unable to update the user's status.",
          variant: "destructive",
        });

        return;
      }

      setCurrentStatus(status);
      onOpenChange(false);

      toast({
        title: "Status updated",
        description: `${user.name}'s account status has been updated.`,
        variant: "success",
      });
    });
  }

  function handleRoleSubmit(roleId: string) {
    const role = assignableRoles.find((item) => item.id === roleId);

    if (!role) {
      return;
    }

    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, roleId);

      if (!result.success) {
        toast({
          title: "Role update failed",
          description: result.message ?? "Unable to update the user's role.",
          variant: "destructive",
        });

        return;
      }

      setCurrentRoleId(roleId);
      onOpenChange(false);

      toast({
        title: "Role updated",
        description: `${user.name}'s role has been changed to ${role.name}.`,
        variant: "success",
      });
    });
  }

  if (mode === "status") {
    return (
      <SelectionDialog
        open={open}
        title="Ubah Status"
        description="Atur status akun pengguna tanpa membuka halaman edit."
        fieldLabel="Status baru"
        value={currentStatus}
        options={STATUS_OPTIONS}
        subjectName={user.name}
        subjectDescription={user.email}
        currentValue={
          <SemanticBadge type={getUserStatusBadgeType(currentStatus)} />
        }
        information={
          <>
            Status <strong>Inactive</strong> atau <strong>Suspended</strong>{" "}
            membatasi akses pengguna ke Nexora.
          </>
        }
        pending={pending}
        renderValue={(option) => (
          <SemanticBadge
            type={getUserStatusBadgeType(option.value)}
            label={option.label}
          />
        )}
        renderOption={(option) => (
          <div className="flex min-w-0 items-center gap-3">
            <SemanticBadge
              type={getUserStatusBadgeType(option.value)}
              label={option.label}
              className="shrink-0"
            />

            <span className="truncate text-xs text-muted-foreground">
              {option.description}
            </span>
          </div>
        )}
        onOpenChange={onOpenChange}
        onSubmit={handleStatusSubmit}
      />
    );
  }

  return (
    <SelectionDialog
      open={open}
      title="Ubah Role"
      description="Atur role dan hak akses pengguna tanpa membuka halaman edit."
      fieldLabel="Role baru"
      value={currentRoleId}
      options={roleOptions}
      subjectName={user.name}
      subjectDescription={user.email}
      currentValue={
        <SemanticBadge
          type={getRoleBadgeType(user.role.code)}
          label={user.role.name}
        />
      }
      information="Hak akses pengguna mengikuti permission yang dimiliki oleh role yang dipilih."
      placeholder="Pilih role"
      pending={pending}
      renderValue={(option) => {
        const role = assignableRoles.find((item) => item.id === option.value);

        return (
          <SemanticBadge
            type={getRoleBadgeType(role?.code ?? "")}
            label={option.label}
          />
        );
      }}
      renderOption={(option) => {
        const role = assignableRoles.find((item) => item.id === option.value);

        return (
          <div className="flex min-w-0 items-center gap-3">
            <SemanticBadge
              type={getRoleBadgeType(role?.code ?? "")}
              label={option.label}
              className="shrink-0"
            />

            <span className="truncate text-xs text-muted-foreground">
              {option.description}
            </span>
          </div>
        );
      }}
      onOpenChange={onOpenChange}
      onSubmit={handleRoleSubmit}
    />
  );
}
