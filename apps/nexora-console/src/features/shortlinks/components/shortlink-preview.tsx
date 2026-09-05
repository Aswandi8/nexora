"use client";

import {
  getShortlinkImageAspectRatio,
  SHORTLINK_IMAGE_ASPECT_RATIO_TOLERANCE,
} from "@nexora/contracts";

import { AlertCircle, CheckCircle2, ImageIcon, Play } from "lucide-react";

import { useState } from "react";

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
} from "../shortlink.utils";

interface ShortlinkPreviewProps {
  slug: string;
  title: string;
  description: string;
  mediaUrl: string;
  displayDurationMs: number;
  status: string;
  mediaWidth?: number | null;
  mediaHeight?: number | null;
  mimeType?: string | null;
  contentLength?: string | null;
  sticky?: boolean;
}

interface PreviewMetadata {
  source: string;
  width: number;
  height: number;
}

interface PreviewError {
  source: string;
  message: string;
}

export function ShortlinkPreview({
  slug,
  title,
  description,
  mediaUrl,
  displayDurationMs,
  status,
  mediaWidth,
  mediaHeight,
  mimeType,
  contentLength,
  sticky = false,
}: ShortlinkPreviewProps) {
  const [detectedMetadata, setDetectedMetadata] =
    useState<PreviewMetadata | null>(null);

  const [detectedError, setDetectedError] = useState<PreviewError | null>(null);

  const normalizedMediaUrl = mediaUrl.trim();
  const mediaSource = normalizedMediaUrl;

  const activeDetectedMetadata =
    detectedMetadata?.source === mediaSource ? detectedMetadata : null;

  const activeError =
    detectedError?.source === mediaSource ? detectedError.message : null;

  const storedMetadata =
    mediaWidth && mediaHeight
      ? {
          width: mediaWidth,
          height: mediaHeight,
        }
      : null;

  const metadata = activeDetectedMetadata ?? storedMetadata;

  const aspectRatio = metadata
    ? getShortlinkImageAspectRatio(metadata.width, metadata.height)
    : null;

  const displayDuration = formatShortlinkDisplayDuration(displayDurationMs);

  const hasMedia = normalizedMediaUrl.length > 0;

  const tolerancePercent = SHORTLINK_IMAGE_ASPECT_RATIO_TOLERANCE * 100;

  return (
    <Card className={sticky ? "p-5 sm:p-6 xl:sticky xl:top-24" : "p-5 sm:p-6"}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Typography as="h2" variant="h3">
            Live preview
          </Typography>

          <Typography variant="muted" className="mt-1">
            Preview is loaded directly by your browser. Nexora Core verifies the
            image and aspect ratio when you save.
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
                  Image preview unavailable
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {activeError}
                </p>
              </div>
            </div>
          ) : hasMedia ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
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
                  });

                  setDetectedError(null);
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

              <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white tabular-nums">
                {displayDuration}
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 w-full flex-col items-center justify-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
                <ImageIcon className="size-5 text-muted-foreground" />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No image preview
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Enter a public image URL.
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
              <SemanticBadge type={getShortlinkMediaBadgeType("IMAGE")} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-xs text-muted-foreground">Dimensions</p>

            <p className="mt-2 font-medium text-foreground">
              {metadata.width} × {metadata.height}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-xs text-muted-foreground">Aspect ratio</p>

            <div
              className={`mt-2 flex items-center gap-2 text-sm font-medium ${
                aspectRatio?.valid ? "text-success" : "text-destructive"
              }`}
            >
              {aspectRatio?.valid ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}

              <span>
                {aspectRatio?.valid
                  ? `16:9 ±${tolerancePercent}%`
                  : "Outside allowed range"}
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              Actual {aspectRatio?.ratio.toFixed(4)}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <p className="text-xs text-muted-foreground">Display duration</p>

            <p className="mt-2 font-medium text-foreground tabular-nums">
              {displayDuration}
            </p>
          </div>

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

      {aspectRatio && !aspectRatio.valid ? (
        <div className="mt-4 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />

          <div>
            <p className="text-sm font-medium text-destructive">
              Invalid image aspect ratio
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Shortlink images must be 16:9 with a maximum tolerance of ±
              {tolerancePercent}%. This image will be rejected when you save.
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
