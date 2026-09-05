import { findActivePublicShortlinkBySlug } from "./public-shortlink.repository";

import { mapPublicShortlink } from "./public-shortlink.mapper";

import type { PublicShortlink } from "./public-shortlink.types";

export async function getPublicShortlinkBySlug(
  slug: string,
): Promise<PublicShortlink | null> {
  const normalizedSlug = slug.trim().toLowerCase();

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
