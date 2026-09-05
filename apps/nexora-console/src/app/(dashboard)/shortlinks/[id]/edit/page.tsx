import type { Metadata } from "next";

import { PERMISSIONS } from "@nexora/contracts";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { requireEveryPermission } from "@/features/auth/permission.server";

import { ShortlinkForm } from "@/features/shortlinks/components/shortlink-form";

import { getShortlink } from "@/features/shortlinks/shortlinks.server";

export const metadata: Metadata = {
  title: "Edit Shortlink",
};

interface EditShortlinkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditShortlinkPage({
  params,
}: EditShortlinkPageProps) {
  await requireEveryPermission([
    PERMISSIONS.SHORTLINKS_READ,
    PERMISSIONS.SHORTLINKS_UPDATE,
  ]);

  const { id } = await params;

  const shortlink = await getShortlink(id);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Resources",
          },
          {
            label: "Shortlinks",
            href: "/shortlinks",
          },
          {
            label: shortlink.title,
          },
        ]}
        title={`Edit ${shortlink.title}`}
        description="Update the destination, metadata, media, and live preview."
      />

      <ShortlinkForm shortlink={shortlink} />
    </div>
  );
}
