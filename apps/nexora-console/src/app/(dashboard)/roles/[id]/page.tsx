import type { Metadata } from "next";

import { PERMISSIONS, SUPER_ADMIN_ROLE_CODE } from "@nexora/contracts";

import { LockKeyhole, Pencil } from "lucide-react";

import Link from "next/link";

import { DetailField } from "@/components/data-display/detail-field";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { Badge } from "@/components/ui/badge";

import { buttonVariants } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { SemanticBadge } from "@/components/ui/semantic-badge";

import { Typography } from "@/components/ui/typography";

import { getRoleBadgeType, getRoleTypeBadgeType } from "@/config/badge.config";

import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";

import { getRole } from "@/features/roles/roles.server";

export const metadata: Metadata = {
  title: "Role Details",
};

interface RoleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const session = await requirePermission(PERMISSIONS.ROLES_READ);

  const { id } = await params;

  const role = await getRole(id);

  const canUpdate = hasPermission(session, PERMISSIONS.ROLES_UPDATE);

  const isProtectedRole = role.code === SUPER_ADMIN_ROLE_CODE;

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Identity",
          },
          {
            label: "Roles",
            href: "/roles",
          },
          {
            label: role.name,
          },
        ]}
        title={role.name}
        description="Review role identity, type, description, and assigned permissions."
        actions={
          canUpdate && !isProtectedRole ? (
            <Link
              href={`/roles/${role.id}/edit`}
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Pencil className="size-4" />
              Edit role
            </Link>
          ) : undefined
        }
      />

      {isProtectedRole ? (
        <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <LockKeyhole className="size-4 text-muted-foreground" />

            <p className="text-sm font-medium text-foreground">
              Protected system role
            </p>

            <SemanticBadge type="generic.protected" />
          </div>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Super Admin identity and permissions are protected and managed by
            Nexora Core.
          </p>
        </div>
      ) : null}

      <Card className="p-5 sm:p-6">
        <div className="mb-6">
          <Typography as="h2" variant="h3">
            Role details
          </Typography>

          <Typography variant="muted" className="mt-1">
            Role identity and classification.
          </Typography>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <DetailField label="Name">{role.name}</DetailField>

          <DetailField label="Code">
            <SemanticBadge
              type={getRoleBadgeType(role.code)}
              label={role.code}
              className="font-mono"
            />
          </DetailField>

          <DetailField label="Type">
            <SemanticBadge type={getRoleTypeBadgeType(role.isSystem)} />
          </DetailField>

          <DetailField
            label="Description"
            className="sm:col-span-2 xl:col-span-3"
          >
            {role.description ? (
              <span className="leading-6">{role.description}</span>
            ) : (
              <span className="text-muted-foreground">
                No description provided.
              </span>
            )}
          </DetailField>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-6">
          <Typography as="h2" variant="h3">
            Permissions
          </Typography>

          <Typography variant="muted" className="mt-1">
            Capabilities assigned to this role.
          </Typography>
        </div>

        {role.permissions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {role.permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="font-mono">
                {permission}
              </Badge>
            ))}
          </div>
        ) : (
          <Typography variant="muted">
            No permissions are assigned to this role.
          </Typography>
        )}
      </Card>
    </div>
  );
}
