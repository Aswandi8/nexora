export type PublicShortlinkMediaType = "IMAGE" | "VIDEO";

export interface PublicShortlink {
  id: string;
  slug: string;
  destinationUrl: string;
  title: string;
  description: string | null;

  mediaType: PublicShortlinkMediaType;
  mediaUrl: string;
  posterUrl: string | null;

  mediaWidth: number;
  mediaHeight: number;

  durationMs: number | null;
  displayDurationMs: number;

  mimeType: string | null;
  contentLength: string | null;

  updatedAt: string;
}

export interface PublicShortlinkRenderContext {
  shortlink: PublicShortlink;
  canonicalUrl: string;
}

export interface PublicShortlinkPlayerRenderContext {
  shortlink: PublicShortlink;
}
