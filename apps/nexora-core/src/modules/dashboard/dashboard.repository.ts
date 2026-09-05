import { prisma } from "@/database";

interface ShortlinkActivityRow {
  date: Date;
  count: bigint;
}

export const dashboardRepository = {
  countShortlinks() {
    return prisma.shortlink.count();
  },

  countUsers() {
    return prisma.user.count();
  },

  countRoles() {
    return prisma.role.count();
  },

  countPermissions() {
    return prisma.permission.count();
  },

  getShortlinkActivity(startDate: Date, endDate: Date) {
    return prisma.$queryRaw<ShortlinkActivityRow[]>`
      SELECT
        DATE_TRUNC('day', "createdAt") AS "date",
        COUNT(*) AS "count"
      FROM "shortlink"
      WHERE
        "createdAt" >= ${startDate}
        AND "createdAt" < ${endDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY "date" ASC
    `;
  },
};
