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

import {
  getRoleBadgeType,
  getUserStatusBadgeType,
} from "@/config/badge.config";

import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";

import { getUser } from "@/features/users/users.server";

import { formatDateTime } from "@/lib/format/date";

export const metadata: Metadata = {
  title: "User Details",
};

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const session = await requirePermission(PERMISSIONS.USERS_READ);

  const { id } = await params;

  const user = await getUser(id);

  const canUpdate = hasPermission(session, PERMISSIONS.USERS_UPDATE);

  const isProtectedUser = user.role.code === SUPER_ADMIN_ROLE_CODE;

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Identity",
          },
          {
            label: "Users",
            href: "/users",
          },
          {
            label: user.name,
          },
        ]}
        title={user.name}
        description="Review user identity, account state, role, and effective permissions."
        actions={
          canUpdate ? (
            <Link
              href={`/users/${user.id}/edit`}
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Pencil className="size-4" />
              Edit user
            </Link>
          ) : undefined
        }
      />

      {isProtectedUser ? (
        <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <LockKeyhole className="size-4 text-muted-foreground" />

            <p className="text-sm font-medium text-foreground">
              Protected Super Admin account
            </p>

            <SemanticBadge type="generic.protected" />
          </div>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Account status and Super Admin role membership are protected by
            Nexora Core.
          </p>
        </div>
      ) : null}

      <Card className="p-5 sm:p-6">
        <div className="mb-6">
          <Typography as="h2" variant="h3">
            Account details
          </Typography>

          <Typography variant="muted" className="mt-1">
            Identity and account lifecycle information.
          </Typography>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <DetailField label="Name">
            <span className="wrap-break-word">{user.name}</span>
          </DetailField>

          <DetailField label="Email">
            <span className="break-all">{user.email}</span>
          </DetailField>

          <DetailField label="Status">
            <SemanticBadge type={getUserStatusBadgeType(user.status)} />
          </DetailField>

          <DetailField label="Role">
            <SemanticBadge
              type={getRoleBadgeType(user.role.code)}
              label={user.role.code}
              className="font-mono"
            />
          </DetailField>

          <DetailField label="Created">
            {formatDateTime(user.createdAt)}
          </DetailField>

          <DetailField label="Last updated">
            {formatDateTime(user.updatedAt)}
          </DetailField>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-6">
          <Typography as="h2" variant="h3">
            Effective permissions
          </Typography>

          <Typography variant="muted" className="mt-1">
            Permissions currently available to this user through the assigned
            role.
          </Typography>
        </div>

        {user.permissions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="font-mono">
                {permission}
              </Badge>
            ))}
          </div>
        ) : (
          <Typography variant="muted">
            No effective permissions are assigned.
          </Typography>
        )}
      </Card>
    </div>
  );
}
