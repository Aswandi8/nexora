import type { Shortlink as ShortlinkDto } from "@nexora/contracts";

import type { Shortlink as PrismaShortlink } from "@/generated/prisma/client";

export function mapShortlink(shortlink: PrismaShortlink): ShortlinkDto {
  return {
    id: shortlink.id,
    slug: shortlink.slug,
    destinationUrl: shortlink.destinationUrl,
    title: shortlink.title,
    description: shortlink.description,

    mediaType: shortlink.mediaType,

    mediaUrl: shortlink.mediaUrl,

    posterUrl: shortlink.posterUrl,

    mediaWidth: shortlink.mediaWidth,

    mediaHeight: shortlink.mediaHeight,

    durationMs: shortlink.durationMs,
    displayDurationMs: shortlink.displayDurationMs,
    mimeType: shortlink.mimeType,

    contentLength:
      shortlink.contentLength === null
        ? null
        : shortlink.contentLength.toString(),

    status: shortlink.status,

    createdAt: shortlink.createdAt.toISOString(),

    updatedAt: shortlink.updatedAt.toISOString(),
  };
}
