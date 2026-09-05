import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "./cache-tags";

export function invalidateDashboardCache(): void {
  revalidateTag(CACHE_TAGS.DASHBOARD, {
    expire: 0,
  });
}
