import type { Metadata } from "next";

import { PERMISSIONS, shortlinkListQuerySchema } from "@nexora/contracts";

import { Plus } from "lucide-react";

import Link from "next/link";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { buttonVariants } from "@/components/ui/button";

import { env } from "@/config/env";

import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";

import { ShortlinksList } from "@/features/shortlinks/components/shortlinks-list";

import { getShortlinks } from "@/features/shortlinks/shortlinks.server";

export const metadata: Metadata = {
  title: "Shortlinks",
};

interface ShortlinksPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function ShortlinksPage({
  searchParams,
}: ShortlinksPageProps) {
  const session = await requirePermission(PERMISSIONS.SHORTLINKS_READ);

  const params = await searchParams;

  const query = shortlinkListQuerySchema.parse({
    page: params.page,
    limit: params.limit,
    search: params.search,
    status: params.status,
  });

  const shortlinks = await getShortlinks(query);

  const canCreate = hasPermission(session, PERMISSIONS.SHORTLINKS_CREATE);

  const canUpdate = hasPermission(session, PERMISSIONS.SHORTLINKS_UPDATE);

  const canDelete = hasPermission(session, PERMISSIONS.SHORTLINKS_DELETE);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Resources",
          },
          {
            label: "Shortlinks",
          },
        ]}
        title="Shortlinks"
        description="Create and manage your Nexora shortlinks."
        actions={
          canCreate ? (
            <Link
              href="/shortlinks/create"
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Plus className="size-4" />
              Create shortlink
            </Link>
          ) : undefined
        }
      />

      <ShortlinksList
        shortlinks={shortlinks.items}
        pagination={shortlinks.pagination}
        publicBaseUrl={env.NEXORA_CORE_URL}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
