import "server-only";

import {
  permissionSchema,
  roleSchema,
  type PaginatedResult,
  type Permission,
  type Role,
  type RoleListItem,
  type RoleTypeFilter,
} from "@nexora/contracts";

import { cache } from "react";

import { serverApiRequest } from "@/lib/api/server";

interface GetRolesOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: RoleTypeFilter;
}

const getRolesCached = cache(
  async (
    page: number,
    limit: number,
    search: string,
    type: RoleTypeFilter,
  ): Promise<PaginatedResult<RoleListItem>> => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (search) {
      params.set("search", search);
    }

    if (type !== "all") {
      params.set("type", type);
    }

    return serverApiRequest<PaginatedResult<RoleListItem>>(
      `/api/roles?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  },
);

const getRoleCached = cache(async (id: string): Promise<Role> => {
  const role = await serverApiRequest<Role>(`/api/roles/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return roleSchema.parse(role);
});

const getPermissionsCached = cache(async (): Promise<Permission[]> => {
  const permissions = await serverApiRequest<Permission[]>("/api/permissions", {
    method: "GET",
    cache: "no-store",
  });

  return permissions.map((permission) => permissionSchema.parse(permission));
});

export function getRoles({
  page = 1,
  limit = 20,
  search = "",
  type = "all",
}: GetRolesOptions = {}): Promise<PaginatedResult<RoleListItem>> {
  return getRolesCached(page, limit, search.trim(), type);
}

export function getRole(id: string): Promise<Role> {
  return getRoleCached(id);
}

export function getPermissions(): Promise<Permission[]> {
  return getPermissionsCached();
}
