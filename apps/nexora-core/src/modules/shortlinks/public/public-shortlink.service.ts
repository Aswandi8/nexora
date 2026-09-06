import { shortlinkSlugSchema } from "@nexora/contracts";

import { mapPublicShortlink } from "./public-shortlink.mapper";
import { findActivePublicShortlinkBySlug } from "./public-shortlink.repository";

import type { PublicShortlink } from "./public-shortlink.types";

function normalizePublicSlug(slug: string): string | null {
  const result = shortlinkSlugSchema.safeParse(slug);

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function getPublicShortlinkBySlug(
  slug: string,
): Promise<PublicShortlink | null> {
  const normalizedSlug = normalizePublicSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  const record = await findActivePublicShortlinkBySlug(normalizedSlug);

  if (!record) {
    return null;
  }

  return mapPublicShortlink(record);
}

export async function getPublicVideoShortlinkBySlug(
  slug: string,
): Promise<PublicShortlink | null> {
  const shortlink = await getPublicShortlinkBySlug(slug);

  if (!shortlink || shortlink.mediaType !== "VIDEO") {
    return null;
  }

  return shortlink;
}
