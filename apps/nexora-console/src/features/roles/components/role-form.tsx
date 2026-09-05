"use client";

import {
  SUPER_ADMIN_ROLE_CODE,
  createRoleSchema,
  type Permission,
  type PermissionCode,
  type Role,
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

import { Textarea } from "@/components/ui/textarea";

import { Typography } from "@/components/ui/typography";

import { useToast } from "@/hooks/use-toast";

import { createRoleCode } from "@/lib/role-code";

import { createRoleAction, updateRoleAction } from "../roles.actions";

import { PermissionSelector } from "./permission-selector";

interface RoleFormProps {
  role?: Role;
  permissions: Permission[];
  canAssignPermissions: boolean;
}

export function RoleForm({
  role,
  permissions,
  canAssignPermissions,
}: RoleFormProps) {
  const router = useRouter();

  const { toast } = useToast();

  const isEditing = Boolean(role);

  const isProtectedRole = role?.code === SUPER_ADMIN_ROLE_CODE;

  const [name, setName] = useState(role?.name ?? "");

  const [code, setCode] = useState(role?.code ?? "");

  const [description, setDescription] = useState(role?.description ?? "");

  const [selectedPermissions, setSelectedPermissions] = useState<
    PermissionCode[]
  >(role?.permissions ?? []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string) {
    if (isProtectedRole || isSubmitting) {
      return;
    }

    setName(value);

    setCode(createRoleCode(value));
  }

  function togglePermission(permission: PermissionCode) {
    if (isProtectedRole || isSubmitting) {
      return;
    }

    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (isProtectedRole) {
      toast({
        title: "Protected role",
        description:
          "The Super Admin role is managed by the system and cannot be modified.",
        variant: "destructive",
      });

      return;
    }

    const parsed = createRoleSchema.safeParse({
      name,
      code,

      description: description.trim() || null,

      permissions: canAssignPermissions
        ? selectedPermissions
        : (role?.permissions ?? []),
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "_root";

        nextErrors[key] ??= issue.message;
      }

      setErrors(nextErrors);

      return;
    }

    setErrors({});

    setIsSubmitting(true);

    const result =
      isEditing && role
        ? await updateRoleAction(role.id, parsed.data)
        : await createRoleAction(parsed.data);

    if (!result.success) {
      setIsSubmitting(false);

      toast({
        title: isEditing ? "Role update failed" : "Role creation failed",
        description: result.message,
        variant: "destructive",
      });

      return;
    }

    toast({
      title: isEditing ? "Role updated" : "Role created",

      description: isEditing
        ? "Role changes have been saved."
        : "The new role is ready to use.",

      variant: "success",
    });

    router.push("/roles");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {isProtectedRole ? (
          <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                Protected system role
              </p>

              <SemanticBadge type="generic.protected" />
            </div>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Super Admin is a protected security role. Its identity and
              permissions are managed by Nexora and cannot be modified.
            </p>
          </div>
        ) : null}

        <Card className="p-5 sm:p-6">
          <div className="mb-6">
            <Typography as="h2" variant="h3">
              Role details
            </Typography>

            <Typography variant="muted" className="mt-1">
              {isProtectedRole
                ? "Review the protected system role identity."
                : isEditing
                  ? "Update the role identity and description."
                  : "Define the role identity and description."}
            </Typography>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <FormField
              label="Name"
              htmlFor="role-name"
              description={
                isProtectedRole
                  ? "Protected system role name."
                  : "Human-readable name shown throughout Nexora."
              }
              error={errors.name}
            >
              <Input
                id="role-name"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Content Manager"
                disabled={isSubmitting || isProtectedRole}
              />
            </FormField>

            <FormField
              label="Code"
              htmlFor="role-code"
              description={
                isProtectedRole
                  ? "Protected system role identifier."
                  : "Generated automatically from the role name."
              }
              error={errors.code}
            >
              <Input
                id="role-code"
                value={code}
                readOnly
                disabled
                placeholder="CONTENT_MANAGER"
                className="font-mono"
              />
            </FormField>

            <FormField
              label="Description"
              htmlFor="role-description"
              error={errors.description}
              className="lg:col-span-2"
            >
              <Textarea
                id="role-description"
                value={description}
                onChange={(event) => {
                  if (isProtectedRole || isSubmitting) {
                    return;
                  }

                  setDescription(event.target.value);
                }}
                placeholder="Describe the responsibilities of this role."
                rows={4}
                disabled={isSubmitting || isProtectedRole}
                className="resize-none"
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-6">
            <Typography as="h2" variant="h3">
              Permissions
            </Typography>

            <Typography variant="muted" className="mt-1">
              {isProtectedRole
                ? "Super Admin permissions are managed by the system and cannot be changed."
                : "Select the capabilities this role is allowed to use."}
            </Typography>
          </div>

          {isProtectedRole ? (
            permissions.length > 0 ? (
              <PermissionSelector
                permissions={permissions}
                selectedPermissions={selectedPermissions}
                disabled
                onToggle={togglePermission}
              />
            ) : (
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <Typography variant="muted">
                  Super Admin permissions are protected and managed by Nexora.
                </Typography>
              </div>
            )
          ) : canAssignPermissions ? (
            <PermissionSelector
              permissions={permissions}
              selectedPermissions={selectedPermissions}
              disabled={isSubmitting}
              onToggle={togglePermission}
            />
          ) : (
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <Typography variant="muted">
                You do not have permission to assign permissions.
              </Typography>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/roles"
            aria-disabled={isSubmitting}
            className={buttonVariants({
              variant: "outline",
            })}
          >
            {isProtectedRole ? "Back to roles" : "Cancel"}
          </Link>

          {!isProtectedRole ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create role"}
            </Button>
          ) : null}
        </div>
      </form>

      {isSubmitting ? <WorkspaceLoading /> : null}
    </>
  );
}
