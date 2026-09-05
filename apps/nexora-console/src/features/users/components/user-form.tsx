"use client";

import {
  SUPER_ADMIN_ROLE_CODE,
  createUserSchema,
  updateUserSchema,
  type RoleListItem,
  type User,
  type UserStatus,
} from "@nexora/contracts";

import { useState, type FormEvent } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { WorkspaceLoading } from "@/components/feedback/workspace-loading";

import { buttonVariants, Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { FormField } from "@/components/ui/form-field";

import { Input } from "@/components/ui/input";

import { SemanticBadge } from "@/components/ui/semantic-badge";

import { Typography } from "@/components/ui/typography";

import { getRoleBadgeType } from "@/config/badge.config";

import { useToast } from "@/hooks/use-toast";

import { createUserAction, updateUserAction } from "../users.actions";

import { UserRoleSelector } from "./user-role-selector";

import { UserStatusSelect } from "./user-status-select";

interface UserFormProps {
  user?: User;
  roles: RoleListItem[];
  canManageRoles: boolean;
}

export function UserForm({ user, roles, canManageRoles }: UserFormProps) {
  const router = useRouter();

  const { toast } = useToast();

  const isEditing = Boolean(user);

  const isProtectedUser = user?.role.code === SUPER_ADMIN_ROLE_CODE;

  const [name, setName] = useState(user?.name ?? "");

  const [email, setEmail] = useState(user?.email ?? "");

  const [status, setStatus] = useState<UserStatus>(user?.status ?? "ACTIVE");

  const [selectedRoleId, setSelectedRoleId] = useState(user?.role.id ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  function changeRole(roleId: string) {
    if (isProtectedUser || !canManageRoles || isSubmitting) {
      return;
    }

    const role = roles.find((item) => item.id === roleId);

    if (!role || role.code === SUPER_ADMIN_ROLE_CODE) {
      return;
    }

    setSelectedRoleId(roleId);
  }

  function setValidationErrors(
    issues: Array<{
      path: PropertyKey[] | readonly PropertyKey[];
      message: string;
    }>,
  ) {
    const nextErrors: Record<string, string> = {};

    for (const issue of issues) {
      const key = issue.path[0]?.toString() ?? "_root";

      nextErrors[key] ??= issue.message;
    }

    setErrors(nextErrors);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (isEditing && user) {
      const parsed = updateUserSchema.safeParse({
        name,
        email,

        ...(isProtectedUser
          ? {}
          : {
              status,
            }),

        ...(!isProtectedUser && canManageRoles
          ? {
              roleId: selectedRoleId,
            }
          : {}),
      });

      if (!parsed.success) {
        setValidationErrors(parsed.error.issues);

        return;
      }

      setErrors({});

      setIsSubmitting(true);

      const result = await updateUserAction(user.id, parsed.data);

      if (!result.success) {
        setIsSubmitting(false);

        toast({
          title: "User update failed",
          description: result.message,
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "User updated",
        description: "User changes have been saved.",
        variant: "success",
      });

      router.push("/users");

      return;
    }

    const parsed = createUserSchema.safeParse({
      name,
      email,
      status,
      roleId: selectedRoleId,
    });

    if (!parsed.success) {
      setValidationErrors(parsed.error.issues);

      return;
    }

    setErrors({});

    setIsSubmitting(true);

    const result = await createUserAction(parsed.data);

    if (!result.success) {
      setIsSubmitting(false);

      toast({
        title: "User creation failed",
        description: result.message,
        variant: "destructive",
      });

      return;
    }

    if (result.invitationSent) {
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${parsed.data.email}.`,
        variant: "success",
      });
    } else {
      toast({
        title: "User created",
        description:
          "The user was created, but the invitation could not be delivered. You can resend it from the Users menu.",
        variant: "destructive",
      });
    }

    router.push("/users");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {isProtectedUser ? (
          <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                Protected Super Admin account
              </p>

              <SemanticBadge type="generic.protected" />
            </div>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The identity of this account may be updated, but its active status
              and Super Admin role are protected by Nexora Core.
            </p>
          </div>
        ) : null}

        <Card className="p-5 sm:p-6">
          <div className="mb-6">
            <Typography as="h2" variant="h3">
              Account details
            </Typography>

            <Typography variant="muted" className="mt-1">
              {isEditing
                ? "Update the user identity, account status, and access role."
                : "Create the user identity and access role. Nexora will send an invitation so the user can create their own password."}
            </Typography>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <FormField label="Name" htmlFor="user-name" error={errors.name}>
              <Input
                id="user-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSubmitting}
                placeholder="John Doe"
                autoComplete="off"
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="user-email"
              description={
                isEditing
                  ? undefined
                  : "An invitation will be sent to this email address."
              }
              error={errors.email}
            >
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                placeholder="john@example.com"
                autoComplete="off"
              />
            </FormField>

            <FormField
              label="Status"
              htmlFor="user-status"
              description={
                isProtectedUser
                  ? "Super Admin must remain active."
                  : isEditing
                    ? "Controls whether this account may access Nexora."
                    : "The account cannot sign in until the invitation is completed."
              }
              error={errors.status}
            >
              <UserStatusSelect
                value={status}
                disabled={isSubmitting || isProtectedUser}
                onChange={setStatus}
              />
            </FormField>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <FormField
              label="Role"
              htmlFor="user-role"
              description={
                isProtectedUser
                  ? "The Super Admin role is protected and cannot be changed."
                  : canManageRoles
                    ? "Select the single access role for this user."
                    : "You do not have access to the role catalogue."
              }
              error={errors.roleId}
            >
              {canManageRoles ? (
                <UserRoleSelector
                  roles={roles}
                  selectedRoleId={selectedRoleId}
                  disabled={isSubmitting || isProtectedUser}
                  onChange={changeRole}
                />
              ) : user ? (
                <div className="flex min-h-9 items-center">
                  <SemanticBadge
                    type={getRoleBadgeType(user.role.code)}
                    label={user.role.code}
                    className="font-mono"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
                  <Typography variant="muted">
                    Role catalogue access is required to create a user.
                  </Typography>
                </div>
              )}
            </FormField>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/users"
            aria-disabled={isSubmitting}
            className={buttonVariants({
              variant: "outline",
            })}
          >
            Cancel
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || (!isEditing && !canManageRoles)}
          >
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Sending invitation..."
              : isEditing
                ? "Save changes"
                : "Create & send invitation"}
          </Button>
        </div>
      </form>

      {isSubmitting ? <WorkspaceLoading /> : null}
    </>
  );
}
