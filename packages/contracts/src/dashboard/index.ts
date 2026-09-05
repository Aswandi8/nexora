import { z } from "zod";

export const dashboardActivityPointSchema = z.object({
  date: z.iso.date(),
  count: z.number().int().nonnegative(),
});

export const dashboardOverviewSchema = z.object({
  shortlinks: z.number().int().nonnegative().nullable(),
  users: z.number().int().nonnegative().nullable(),
  roles: z.number().int().nonnegative().nullable(),
  permissions: z.number().int().nonnegative().nullable(),
  shortlinkActivity: z.array(dashboardActivityPointSchema).nullable(),
});

export type DashboardActivityPoint = z.infer<
  typeof dashboardActivityPointSchema
>;

export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
