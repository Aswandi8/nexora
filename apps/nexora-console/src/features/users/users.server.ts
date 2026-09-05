import "server-only";

import {
  roleListItemSchema,
  userSchema,
  type PaginatedResult,
  type RoleListItem,
  type User,
  type UserListItem,
  type UserStatusFilter,
} from "@nexora/contracts";

import { cache } from "react";

import { serverApiRequest } from "@/lib/api/server";

interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatusFilter;
}

const getUsersCached = cache(
  async (
    page: number,
    limit: number,
    search: string,
    status: UserStatusFilter,
  ): Promise<PaginatedResult<UserListItem>> => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (search) {
      params.set("search", search);
    }

    if (status !== "all") {
      params.set("status", status);
    }

    return serverApiRequest<PaginatedResult<UserListItem>>(
      `/api/users?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  },
);

const getUserCached = cache(async (id: string): Promise<User> => {
  const user = await serverApiRequest<User>(`/api/users/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return userSchema.parse(user);
});

const getUserRoleOptionsCached = cache(async (): Promise<RoleListItem[]> => {
  const result = await serverApiRequest<PaginatedResult<RoleListItem>>(
    "/api/roles?page=1&limit=100",
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return result.items.map((role) => roleListItemSchema.parse(role));
});

export function getUsers({
  page = 1,
  limit = 20,
  search = "",
  status = "all",
}: GetUsersOptions = {}): Promise<PaginatedResult<UserListItem>> {
  return getUsersCached(page, limit, search.trim(), status);
}

export function getUser(id: string): Promise<User> {
  return getUserCached(id);
}

export function getUserRoleOptions(): Promise<RoleListItem[]> {
  return getUserRoleOptionsCached();
}
