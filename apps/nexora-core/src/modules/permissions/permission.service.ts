import {
  permissionListQuerySchema,
  permissionSchema,
  type PaginatedResult,
  type Permission,
} from "@nexora/contracts";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/cache-tags";

import { permissionRepository } from "./permission.repository";

const PERMISSION_CATALOGUE_REVALIDATE_SECONDS = 3600;

function mapPermission(permission: {
  id: string;
  code: string;
  name: string;
  description: string | null;
}): Permission {
  return permissionSchema.parse({
    id: permission.id,
    code: permission.code,
    name: permission.name,
    description: permission.description,
  });
}

const getPermissionCatalogueCached = unstable_cache(
  async (): Promise<Permission[]> => {
    const permissions = await permissionRepository.findAll();

    return permissions.map(mapPermission);
  },

  ["permission-catalogue"],

  {
    tags: [CACHE_TAGS.PERMISSION_CATALOGUE],
    revalidate: PERMISSION_CATALOGUE_REVALIDATE_SECONDS,
  },
);

export function listPermissions(): Promise<Permission[]> {
  return getPermissionCatalogueCached();
}

export async function listPermissionsPaginated(
  input: unknown,
): Promise<PaginatedResult<Permission>> {
  const query = permissionListQuerySchema.parse(input);

  const skip = (query.page - 1) * query.limit;

  const [permissions, total] = await Promise.all([
    permissionRepository.findMany({
      skip,
      take: query.limit,
      search: query.search,
      resource: query.resource,
    }),

    permissionRepository.count({
      search: query.search,
      resource: query.resource,
    }),
  ]);

  return {
    items: permissions.map(mapPermission),

    pagination: {
      page: query.page,
      limit: query.limit,
      total,

      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}
