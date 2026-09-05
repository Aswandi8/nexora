import type { DashboardOverview as DashboardOverviewData } from "@nexora/contracts";

import { KeyRound, Link2, ShieldCheck, Users } from "lucide-react";

import { Typography } from "@/components/ui/typography";

import { OverviewCard } from "./overview-card";

interface DashboardOverviewProps {
  overview: DashboardOverviewData;
}

export function DashboardOverview({ overview }: DashboardOverviewProps) {
  return (
    <section aria-labelledby="dashboard-overview-title" className="space-y-4">
      <div>
        <Typography as="h2" id="dashboard-overview-title" variant="h3">
          Overview
        </Typography>

        <Typography variant="muted" className="mt-1">
          Current resources available in your Nexora workspace.
        </Typography>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {overview.shortlinks !== null ? (
          <OverviewCard
            title="Shortlinks"
            value={overview.shortlinks}
            description="Managed shortlinks"
            href="/shortlinks"
            icon={Link2}
          />
        ) : null}

        {overview.users !== null ? (
          <OverviewCard
            title="Users"
            value={overview.users}
            description="Workspace users"
            href="/users"
            icon={Users}
          />
        ) : null}

        {overview.roles !== null ? (
          <OverviewCard
            title="Roles"
            value={overview.roles}
            description="Configured roles"
            href="/roles"
            icon={ShieldCheck}
          />
        ) : null}

        {overview.permissions !== null ? (
          <OverviewCard
            title="Permissions"
            value={overview.permissions}
            description="Available permissions"
            href="/permissions"
            icon={KeyRound}
          />
        ) : null}
      </div>
    </section>
  );
}
