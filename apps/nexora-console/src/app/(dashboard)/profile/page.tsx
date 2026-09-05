import type { Metadata } from "next";

import { PageHeaderCard } from "@/components/layout/page-header-card";
import { requireAdminSession } from "@/features/auth/auth.server";
import { ProfileForm } from "@/features/profile/components/profile-form";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await requireAdminSession();

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Account",
          },
          {
            label: "Profile",
          },
        ]}
        title="Profile"
        description="Manage your personal information and account identity."
      />

      <ProfileForm session={session} />
    </div>
  );
}
