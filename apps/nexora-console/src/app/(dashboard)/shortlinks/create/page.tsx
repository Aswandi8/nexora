import type { Metadata } from "next";

import { PERMISSIONS } from "@nexora/contracts";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { requirePermission } from "@/features/auth/permission.server";

import { ShortlinkForm } from "@/features/shortlinks/components/shortlink-form";

export const metadata: Metadata = {
  title: "Create Shortlink",
};

export default async function CreateShortlinkPage() {
  await requirePermission(PERMISSIONS.SHORTLINKS_CREATE);

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
            label: "Create",
          },
        ]}
        title="Create shortlink"
        description="Create a shortlink with verified media and live social preview."
      />

      <ShortlinkForm />
    </div>
  );
}
