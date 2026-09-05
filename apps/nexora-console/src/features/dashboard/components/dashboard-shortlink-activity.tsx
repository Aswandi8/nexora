import type { DashboardActivityPoint } from "@nexora/contracts";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

import { ShortlinkActivityChart } from "./shortlink-activity-chart";

interface DashboardShortlinkActivityProps {
  activity: DashboardActivityPoint[];
}

export function DashboardShortlinkActivity({
  activity,
}: DashboardShortlinkActivityProps) {
  return (
    <section
      aria-labelledby="dashboard-shortlink-activity-title"
      className="flex h-full flex-col space-y-4"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typography
              as="h2"
              id="dashboard-shortlink-activity-title"
              variant="h3"
            >
              Shortlink Activity
            </Typography>

            <Typography variant="muted" className="mt-1">
              Shortlinks created over the last 7 days.
            </Typography>
          </div>

          <span className="shrink-0 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Last 7 days
          </span>
        </div>
      </div>

      <Card className="flex min-h-0 flex-1 items-center p-4 sm:p-6">
        <ShortlinkActivityChart data={activity} />
      </Card>
    </section>
  );
}
