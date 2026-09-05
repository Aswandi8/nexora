"use client";

import type { ShortlinkMediaType } from "@nexora/contracts";

import { AlertCircle, ImageIcon, Pause, Play, Video } from "lucide-react";

import { useRef, useState } from "react";

import { RemoteImage } from "@/components/media/remote-image";
import { Card } from "@/components/ui/card";
import { SemanticBadge } from "@/components/ui/semantic-badge";
import { Typography } from "@/components/ui/typography";

import {
  getShortlinkMediaBadgeType,
  getShortlinkStatusBadgeType,
} from "@/config/badge.config";

import {
  formatShortlinkBytes,
  formatShortlinkDisplayDuration,
  formatShortlinkDuration,
} from "../shortlink.utils";

interface ShortlinkPreviewProps {
  slug: string;
  title: string;
  description: string;
  mediaType: ShortlinkMediaType;
  mediaUrl: string;
  posterUrl: string;
  displayDurationMs: number;
  status: string;
  mediaWidth?: number | null;
  mediaHeight?: number | null;
  durationMs?: number | null;
  mimeType?: string | null;
  contentLength?: string | null;
  sticky?: boolean;
}

interface PreviewMetadata {
  source: string;
  width: number;
  height: number;
  durationMs: number | null;
}

interface PreviewError {
  source: string;
  message: string;
}

function createMediaSource(
  mediaType: ShortlinkMediaType,
  mediaUrl: string,
): string {
  return `${mediaType}:${mediaUrl.trim()}`;
}

export function ShortlinkPreview({
  slug,
  title,
  description,
  mediaType,
  mediaUrl,
  posterUrl,
  displayDurationMs,
  status,
  mediaWidth,
  mediaHeight,
  durationMs,
  mimeType,
  contentLength,
  sticky = false,
}: ShortlinkPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [detectedMetadata, setDetectedMetadata] =
    useState<PreviewMetadata | null>(null);

  const [detectedError, setDetectedError] = useState<PreviewError | null>(null);

  const normalizedMediaUrl = mediaUrl.trim();

  const mediaSource = createMediaSource(mediaType, normalizedMediaUrl);

  const activeDetectedMetadata =
    detectedMetadata?.source === mediaSource ? detectedMetadata : null;

  const activeError =
    detectedError?.source === mediaSource ? detectedError.message : null;

  const storedMetadata =
    mediaWidth && mediaHeight
      ? {
          width: mediaWidth,
          height: mediaHeight,
          durationMs: durationMs ?? null,
        }
      : null;

  const metadata = activeDetectedMetadata ?? storedMetadata;

  const ratio =
    metadata && metadata.height > 0 ? metadata.width / metadata.height : 16 / 9;

  const previewWidth = ratio < 0.8 ? "62%" : ratio <= 1.2 ? "78%" : "100%";

  const displayDuration = formatShortlinkDisplayDuration(displayDurationMs);

  const hasMedia = normalizedMediaUrl.length > 0;

  async function toggleVideoPlayback() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }

      return;
    }

    video.pause();
  }

  return (
    <Card className={sticky ? "p-5 sm:p-6 xl:sticky xl:top-24" : "p-5 sm:p-6"}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Typography as="h2" variant="h3">
            Live preview
          </Typography>

          <Typography variant="muted" className="mt-1">
            Preview is loaded directly by your browser. Nexora Core verifies the
            media once when you save.
          </Typography>
        </div>

        <SemanticBadge type={getShortlinkStatusBadgeType(status)} />
      </div>

      <div className="rounded-xl border border-border bg-background p-3">
        <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-lg bg-secondary/30">
          {activeError ? (
            <div className="flex min-h-56 w-full flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertCircle className="size-6 text-destructive" />

              <div>
                <p className="text-sm font-medium text-foreground">
                  Media preview unavailable
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {activeError}
                </p>
              </div>
            </div>
          ) : hasMedia ? (
            <div
              className="relative overflow-hidden rounded-lg bg-black"
              style={{
                width: previewWidth,
                aspectRatio: metadata
                  ? `${metadata.width} / ${metadata.height}`
                  : "16 / 9",
              }}
            >
              {mediaType === "IMAGE" ? (
                <>
                  <RemoteImage
                    key={mediaSource}
                    src={normalizedMediaUrl}
                    alt={title.trim() || "Shortlink image preview"}
                    sizes="(min-width: 1280px) 420px, 100vw"
                    onLoad={(event) => {
                      const image = event.currentTarget;

                      if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
                        return;
                      }

                      setDetectedMetadata({
                        source: mediaSource,
                        width: image.naturalWidth,
                        height: image.naturalHeight,
                        durationMs: null,
                      });
                    }}
                    onError={() => {
                      setDetectedError({
                        source: mediaSource,
                        message: "The browser could not load this image URL.",
                      });
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-black/10" />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-xl backdrop-blur-sm">
                      <Play className="ml-0.5 size-6 fill-current" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <video
                    key={`${mediaSource}:${posterUrl}`}
                    ref={videoRef}
                    src={normalizedMediaUrl}
                    poster={posterUrl.trim() || undefined}
                    preload="metadata"
                    playsInline
                    aria-label={title.trim() || "Shortlink video preview"}
                    className="absolute inset-0 size-full object-cover"
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;

                      setDetectedMetadata({
                        source: mediaSource,
                        width: video.videoWidth || mediaWidth || 16,
                        height: video.videoHeight || mediaHeight || 9,
                        durationMs: Number.isFinite(video.duration)
                          ? Math.max(0, Math.round(video.duration * 1000))
                          : null,
                      });
                    }}
                    onError={() => {
                      setDetectedError({
                        source: mediaSource,
                        message: "The browser could not load this video URL.",
                      });
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-black/10" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={toggleVideoPlayback}
                      className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-xl backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      aria-label={
                        isPlaying ? "Pause video preview" : "Play video preview"
                      }
                    >
                      {isPlaying ? (
                        <Pause className="size-6 fill-current" />
                      ) : (
                        <Play className="ml-0.5 size-6 fill-current" />
                      )}
                    </button>
                  </div>
                </>
              )}

              <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white tabular-nums">
                {displayDuration}
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 w-full flex-col items-center justify-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
                {mediaType === "VIDEO" ? (
                  <Video className="size-5 text-muted-foreground" />
                ) : (
                  <ImageIcon className="size-5 text-muted-foreground" />
                )}
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No media preview
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Enter a public {mediaType === "VIDEO" ? "video" : "image"}{" "}
                  URL.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-1 pt-4">
          <p className="line-clamp-2 text-sm font-semibold text-foreground">
            {title.trim() || "Shortlink title"}
          </p>

          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {description.trim() || "Shortlink description will appear here."}
          </p>

          <p className="mt-3 truncate text-xs font-medium text-muted-foreground">
            Nexora · /{slug.trim() || "shortlink-slug"}
          </p>
        </div>
      </div>

      {metadata ? (
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-xs text-muted-foreground">Media</p>

            <div className="mt-2">
              <SemanticBadge type={getShortlinkMediaBadgeType(mediaType)} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-xs text-muted-foreground">Dimensions</p>

            <p className="mt-2 font-medium text-foreground">
              {metadata.width} × {metadata.height}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-xs text-muted-foreground">Display duration</p>

            <p className="mt-2 font-medium text-foreground tabular-nums">
              {displayDuration}
            </p>
          </div>

          {mediaType === "VIDEO" ? (
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="text-xs text-muted-foreground">Original duration</p>

              <p className="mt-2 font-medium text-foreground tabular-nums">
                {formatShortlinkDuration(metadata.durationMs)}
              </p>
            </div>
          ) : null}

          {mimeType !== undefined ? (
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="text-xs text-muted-foreground">MIME type</p>

              <p className="mt-2 truncate font-medium text-foreground">
                {mimeType ?? "—"}
              </p>
            </div>
          ) : null}

          {contentLength !== undefined ? (
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="text-xs text-muted-foreground">File size</p>

              <p className="mt-2 font-medium text-foreground">
                {formatShortlinkBytes(contentLength ?? null)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
