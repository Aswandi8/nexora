import type {
  PublicShortlink,
  PublicShortlinkMediaType,
} from "./public-shortlink.types";

interface PublicShortlinkDatabaseRecord {
  id: string;
  slug: string;
  destinationUrl: string;
  title: string;
  description: string | null;

  mediaType: string;
  mediaUrl: string;
  posterUrl: string | null;

  mediaWidth: number;
  mediaHeight: number;

  durationMs: number | null;
  displayDurationMs: number;

  mimeType: string | null;
  contentLength: bigint | null;

  updatedAt: Date;
}

function mapMediaType(mediaType: string): PublicShortlinkMediaType {
  if (mediaType === "IMAGE") {
    return "IMAGE";
  }

  if (mediaType === "VIDEO") {
    return "VIDEO";
  }

  throw new Error(`UNSUPPORTED_SHORTLINK_MEDIA_TYPE:${mediaType}`);
}

export function mapPublicShortlink(
  record: PublicShortlinkDatabaseRecord,
): PublicShortlink {
  return {
    id: record.id,
    slug: record.slug,
    destinationUrl: record.destinationUrl,
    title: record.title,
    description: record.description,

    mediaType: mapMediaType(record.mediaType),

    mediaUrl: record.mediaUrl,
    posterUrl: record.posterUrl,

    mediaWidth: record.mediaWidth,
    mediaHeight: record.mediaHeight,

    durationMs: record.durationMs,
    displayDurationMs: record.displayDurationMs,

    mimeType: record.mimeType,

    contentLength: record.contentLength?.toString() ?? null,

    updatedAt: record.updatedAt.toISOString(),
  };
}
