import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/database";

export type ShortlinkListOptions = {
  skip: number;

  take: number;

  where?: Prisma.ShortlinkWhereInput;
};

export const shortlinkRepository = {
  findById(id: string) {
    return prisma.shortlink.findUnique({
      where: {
        id,
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.shortlink.findUnique({
      where: {
        slug,
      },
    });
  },

  findMany({ skip, take, where }: ShortlinkListOptions) {
    return prisma.shortlink.findMany({
      skip,

      take,

      where,

      orderBy: {
        createdAt: "desc",
      },
    });
  },

  count(where?: Prisma.ShortlinkWhereInput) {
    return prisma.shortlink.count({
      where,
    });
  },

  create(data: Prisma.ShortlinkCreateInput) {
    return prisma.shortlink.create({
      data,
    });
  },

  update(id: string, data: Prisma.ShortlinkUpdateInput) {
    return prisma.shortlink.update({
      where: {
        id,
      },

      data,
    });
  },

  delete(id: string) {
    return prisma.shortlink.delete({
      where: {
        id,
      },
    });
  },
};
