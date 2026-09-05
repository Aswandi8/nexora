import type { Metadata } from "next";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { requireAdminSession } from "@/features/auth/auth.server";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Account",
          },
        ]}
        title="Account"
        description="Manage your Nexora account and personal information."
      />
    </div>
  );
}
