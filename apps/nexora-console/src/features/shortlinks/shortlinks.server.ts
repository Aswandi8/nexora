import "server-only";

import {
  shortlinkSchema,
  type PaginatedResult,
  type Shortlink,
  type ShortlinkListQuery,
} from "@nexora/contracts";

import { cache } from "react";

import { serverApiRequest } from "@/lib/api/server";

const getShortlinksCached = cache(
  async (
    page: number,
    limit: number,
    search: string,
    status: ShortlinkListQuery["status"],
    mediaType: ShortlinkListQuery["mediaType"],
  ): Promise<PaginatedResult<Shortlink>> => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (search) {
      params.set("search", search);
    }

    if (status !== "all") {
      params.set("status", status);
    }

    if (mediaType !== "all") {
      params.set("mediaType", mediaType);
    }

    const result = await serverApiRequest<PaginatedResult<Shortlink>>(
      `/api/shortlinks?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    return {
      items: result.items.map((shortlink) => shortlinkSchema.parse(shortlink)),
      pagination: result.pagination,
    };
  },
);

const getShortlinkCached = cache(async (id: string): Promise<Shortlink> => {
  const result = await serverApiRequest<Shortlink>(`/api/shortlinks/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return shortlinkSchema.parse(result);
});

export function getShortlinks(
  query: ShortlinkListQuery,
): Promise<PaginatedResult<Shortlink>> {
  return getShortlinksCached(
    query.page,
    query.limit,
    query.search.trim(),
    query.status,
    query.mediaType,
  );
}

export function getShortlink(id: string): Promise<Shortlink> {
  return getShortlinkCached(id);
}
