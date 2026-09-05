import "server-only";

import type { PaginatedResult, Permission } from "@nexora/contracts";

import { cache } from "react";

import { serverApiRequest } from "@/lib/api/server";

interface GetPermissionsOptions {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
}

const getPermissionsListCached = cache(
  async (
    page: number,
    limit: number,
    search: string,
    resource: string,
  ): Promise<PaginatedResult<Permission>> => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (search) {
      params.set("search", search);
    }

    if (resource !== "all") {
      params.set("resource", resource);
    }

    return serverApiRequest<PaginatedResult<Permission>>(
      `/api/permissions/list?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  },
);

export function getPermissionsList({
  page = 1,
  limit = 20,
  search = "",
  resource = "all",
}: GetPermissionsOptions = {}): Promise<PaginatedResult<Permission>> {
  return getPermissionsListCached(page, limit, search.trim(), resource);
}
