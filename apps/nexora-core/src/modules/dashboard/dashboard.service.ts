import {
  dashboardOverviewSchema,
  PERMISSIONS,
  type DashboardActivityPoint,
  type DashboardOverview,
  type PermissionCode,
} from "@nexora/contracts";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/cache-tags";

import { dashboardRepository } from "./dashboard.repository";

const SHORTLINK_ACTIVITY_DAYS = 7;
const DASHBOARD_REVALIDATE_SECONDS = 30;

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number) {
  const result = new Date(date);

  result.setUTCDate(result.getUTCDate() + days);

  return result;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function getShortlinkActivity(): Promise<DashboardActivityPoint[]> {
  const today = startOfUtcDay(new Date());

  const startDate = addUtcDays(today, -(SHORTLINK_ACTIVITY_DAYS - 1));

  const endDate = addUtcDays(today, 1);

  const rows = await dashboardRepository.getShortlinkActivity(
    startDate,
    endDate,
  );

  const countsByDate = new Map(
    rows.map((row) => [toDateKey(row.date), Number(row.count)]),
  );

  return Array.from(
    {
      length: SHORTLINK_ACTIVITY_DAYS,
    },
    (_, index) => {
      const date = addUtcDays(startDate, index);
      const dateKey = toDateKey(date);

      return {
        date: dateKey,
        count: countsByDate.get(dateKey) ?? 0,
      };
    },
  );
}

const getShortlinkCountCached = unstable_cache(
  () => dashboardRepository.countShortlinks(),
  ["dashboard-shortlink-count"],
  {
    tags: [CACHE_TAGS.DASHBOARD],
    revalidate: DASHBOARD_REVALIDATE_SECONDS,
  },
);

const getUserCountCached = unstable_cache(
  () => dashboardRepository.countUsers(),
  ["dashboard-user-count"],
  {
    tags: [CACHE_TAGS.DASHBOARD],
    revalidate: DASHBOARD_REVALIDATE_SECONDS,
  },
);

const getRoleCountCached = unstable_cache(
  () => dashboardRepository.countRoles(),
  ["dashboard-role-count"],
  {
    tags: [CACHE_TAGS.DASHBOARD],
    revalidate: DASHBOARD_REVALIDATE_SECONDS,
  },
);

const getPermissionCountCached = unstable_cache(
  () => dashboardRepository.countPermissions(),
  ["dashboard-permission-count"],
  {
    tags: [CACHE_TAGS.DASHBOARD],
    revalidate: DASHBOARD_REVALIDATE_SECONDS,
  },
);

const getShortlinkActivityCached = unstable_cache(
  getShortlinkActivity,
  ["dashboard-shortlink-activity"],
  {
    tags: [CACHE_TAGS.DASHBOARD],
    revalidate: DASHBOARD_REVALIDATE_SECONDS,
  },
);

export async function getDashboardOverview(
  permissions: PermissionCode[],
): Promise<DashboardOverview> {
  const canReadShortlinks = permissions.includes(PERMISSIONS.SHORTLINKS_READ);

  const canReadUsers = permissions.includes(PERMISSIONS.USERS_READ);

  const canReadRoles = permissions.includes(PERMISSIONS.ROLES_READ);

  const canReadPermissions = permissions.includes(PERMISSIONS.PERMISSIONS_READ);

  const [shortlinks, users, roles, availablePermissions, shortlinkActivity] =
    await Promise.all([
      canReadShortlinks ? getShortlinkCountCached() : Promise.resolve(null),

      canReadUsers ? getUserCountCached() : Promise.resolve(null),

      canReadRoles ? getRoleCountCached() : Promise.resolve(null),

      canReadPermissions ? getPermissionCountCached() : Promise.resolve(null),

      canReadShortlinks ? getShortlinkActivityCached() : Promise.resolve(null),
    ]);

  return dashboardOverviewSchema.parse({
    shortlinks,
    users,
    roles,
    permissions: availablePermissions,
    shortlinkActivity,
  });
}
