import "server-only";

import {
  dashboardOverviewSchema,
  type DashboardOverview,
} from "@nexora/contracts";

import { cache } from "react";

import { serverApiRequest } from "@/lib/api/server";

const getDashboardOverviewCached = cache(
  async (): Promise<DashboardOverview> => {
    const data = await serverApiRequest<DashboardOverview>(
      "/api/dashboard/overview",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    return dashboardOverviewSchema.parse(data);
  },
);

export function getDashboardOverview(): Promise<DashboardOverview> {
  return getDashboardOverviewCached();
}
