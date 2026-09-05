import type { PermissionCode, RoleTypeFilter } from "@nexora/contracts";

import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/database";

export type RoleListOptions = {
  skip: number;
  take: number;
  search: string;
  type: RoleTypeFilter;
};

const roleDetailInclude = {
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
} satisfies Prisma.RoleInclude;

function createRoleWhere({
  search,
  type,
}: Pick<RoleListOptions, "search" | "type">): Prisma.RoleWhereInput {
  return {
    ...(type === "system"
      ? {
          isSystem: true,
        }
      : type === "custom"
        ? {
            isSystem: false,
          }
        : {}),

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
              code: {
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

function createRolePermissions(permissions: PermissionCode[]) {
  return permissions.map((code) => ({
    permission: {
      connect: {
        code,
      },
    },
  }));
}

export const roleRepository = {
  findMany({ skip, take, search, type }: RoleListOptions) {
    return prisma.role.findMany({
      where: createRoleWhere({
        search,
        type,
      }),
      skip,
      take,
      orderBy: [
        {
          isSystem: "desc",
        },
        {
          name: "asc",
        },
      ],
      include: {
        _count: {
          select: {
            userRoles: true,
            rolePermissions: true,
          },
        },
      },
    });
  },

  count({ search, type }: Pick<RoleListOptions, "search" | "type">) {
    return prisma.role.count({
      where: createRoleWhere({
        search,
        type,
      }),
    });
  },

  findById(id: string) {
    return prisma.role.findUnique({
      where: {
        id,
      },
      include: roleDetailInclude,
    });
  },

  findByCode(code: string) {
    return prisma.role.findUnique({
      where: {
        code,
      },
    });
  },

  create(data: {
    name: string;
    code: string;
    description: string | null;
    permissions: PermissionCode[];
  }) {
    return prisma.role.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        isSystem: false,
        rolePermissions: {
          create: createRolePermissions(data.permissions),
        },
      },
      include: roleDetailInclude,
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string | null;
      permissions?: PermissionCode[];
    },
  ) {
    return prisma.role.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,

        ...(data.permissions !== undefined
          ? {
              rolePermissions: {
                deleteMany: {},
                create: createRolePermissions(data.permissions),
              },
            }
          : {}),
      },
      include: roleDetailInclude,
    });
  },

  delete(id: string) {
    return prisma.role.delete({
      where: {
        id,
      },
    });
  },
};
