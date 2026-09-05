import type { Metadata } from "next";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { requireAdminSession } from "@/features/auth/auth.server";

import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { DashboardQuickActions } from "@/features/dashboard/components/dashboard-quick-actions";
import { DashboardShortlinkActivity } from "@/features/dashboard/components/dashboard-shortlink-activity";
import { getDashboardOverview } from "@/features/dashboard/dashboard.server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [authContext, overview] = await Promise.all([
    requireAdminSession(),
    getDashboardOverview(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Dashboard",
          },
        ]}
        title="Dashboard"
        description="Overview of your Nexora workspace."
      />

      <div className="space-y-8">
        <DashboardOverview overview={overview} />

        <div className="grid gap-6 xl:grid-cols-10">
          {overview.shortlinkActivity !== null ? (
            <div className="xl:col-span-6">
              <DashboardShortlinkActivity
                activity={overview.shortlinkActivity}
              />
            </div>
          ) : null}

          <div
            className={
              overview.shortlinkActivity !== null
                ? "xl:col-span-4"
                : "xl:col-span-10"
            }
          >
            <DashboardQuickActions permissions={authContext.permissions} />
          </div>
        </div>
      </div>
    </div>
  );
}
