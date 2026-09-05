import { PERMISSION_VALUES } from "@nexora/contracts";

import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/database";

export interface PermissionListOptions {
  skip: number;
  take: number;
  search: string;
  resource: string;
}

function createPermissionWhere({
  search,
  resource,
}: Pick<
  PermissionListOptions,
  "search" | "resource"
>): Prisma.PermissionWhereInput {
  return {
    code: {
      in: [...PERMISSION_VALUES],

      ...(resource !== "all"
        ? {
            startsWith: `${resource}.`,
          }
        : {}),
    },

    ...(search
      ? {
          OR: [
            {
              code: {
                contains: search,
                mode: "insensitive",
              },
            },

            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },

            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };
}

export const permissionRepository = {
  findAll() {
    return prisma.permission.findMany({
      where: {
        code: {
          in: [...PERMISSION_VALUES],
        },
      },

      orderBy: {
        code: "asc",
      },
    });
  },

  findMany({ skip, take, search, resource }: PermissionListOptions) {
    return prisma.permission.findMany({
      where: createPermissionWhere({
        search,
        resource,
      }),

      skip,

      take,

      orderBy: {
        code: "asc",
      },
    });
  },

  count({
    search,
    resource,
  }: Pick<PermissionListOptions, "search" | "resource">) {
    return prisma.permission.count({
      where: createPermissionWhere({
        search,
        resource,
      }),
    });
  },
};
