import type { Metadata } from "next";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { requireAdminSession } from "@/features/auth/auth.server";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Configuration",
          },
          {
            label: "Settings",
          },
        ]}
        title="Settings"
        description="Configure your Nexora Console preferences."
      />
    </div>
  );
}
