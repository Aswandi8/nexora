import type { UserStatusFilter } from "@nexora/contracts";

import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/database";

export interface UserListOptions {
  skip: number;
  take: number;
  search: string;
  status: UserStatusFilter;
}

const userDetailInclude = {
  userRole: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
            orderBy: {
              permission: {
                code: "asc" as const,
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

function createUserWhere({
  search,
  status,
}: Pick<UserListOptions, "search" | "status">): Prisma.UserWhereInput {
  return {
    ...(status !== "all" ? { status } : {}),
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              userRole: {
                is: {
                  role: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                      {
                        code: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
  };
}

export const userRepository = {
  findMany({ skip, take, search, status }: UserListOptions) {
    return prisma.user.findMany({
      where: createUserWhere({
        search,
        status,
      }),
      skip,
      take,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });
  },

  count({ search, status }: Pick<UserListOptions, "search" | "status">) {
    return prisma.user.count({
      where: createUserWhere({
        search,
        status,
      }),
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      include: userDetailInclude,
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });
  },

  findRoleById(roleId: string) {
    return prisma.role.findUnique({
      where: {
        id: roleId,
      },
      select: {
        id: true,
        code: true,
      },
    });
  },

  configureCreatedUser(
    id: string,
    data: {
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
      roleId: string;
    },
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        status: data.status,
        sessions: {
          deleteMany: {},
        },
        userRole: {
          create: {
            roleId: data.roleId,
          },
        },
      },
      include: userDetailInclude,
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      email?: string;
      status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
      roleId?: string;
      revokeSessions?: boolean;
    },
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        email: data.email,
        status: data.status,
        ...(data.roleId !== undefined
          ? {
              userRole: {
                upsert: {
                  update: {
                    roleId: data.roleId,
                  },
                  create: {
                    roleId: data.roleId,
                  },
                },
              },
            }
          : {}),
        ...(data.revokeSessions
          ? {
              sessions: {
                deleteMany: {},
              },
            }
          : {}),
      },
      include: userDetailInclude,
    });
  },

  delete(id: string) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  },
};
