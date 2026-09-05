import type { Metadata } from "next";

import { PERMISSIONS } from "@nexora/contracts";

import { ExternalLink, Pencil } from "lucide-react";

import Link from "next/link";

import { DetailField } from "@/components/data-display/detail-field";

import { PageHeaderCard } from "@/components/layout/page-header-card";

import { buttonVariants } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { SemanticBadge } from "@/components/ui/semantic-badge";

import { Typography } from "@/components/ui/typography";

import {
  getShortlinkMediaBadgeType,
  getShortlinkStatusBadgeType,
} from "@/config/badge.config";

import {
  hasPermission,
  requirePermission,
} from "@/features/auth/permission.server";

import { ShortlinkPreview } from "@/features/shortlinks/components/shortlink-preview";

import {
  formatShortlinkBytes,
  formatShortlinkDisplayDuration,
  formatShortlinkDuration,
} from "@/features/shortlinks/shortlink.utils";

import { getShortlink } from "@/features/shortlinks/shortlinks.server";

import { formatDateTime } from "@/lib/format/date";

export const metadata: Metadata = {
  title: "Shortlink Details",
};

interface ShortlinkDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ShortlinkDetailsPage({
  params,
}: ShortlinkDetailsPageProps) {
  const session = await requirePermission(PERMISSIONS.SHORTLINKS_READ);

  const { id } = await params;

  const shortlink = await getShortlink(id);

  const canUpdate = hasPermission(session, PERMISSIONS.SHORTLINKS_UPDATE);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Resources",
          },
          {
            label: "Shortlinks",
            href: "/shortlinks",
          },
          {
            label: shortlink.title,
          },
        ]}
        title={shortlink.title}
        description="Review destination, media metadata, status, and preview."
        actions={
          canUpdate ? (
            <Link
              href={`/shortlinks/${shortlink.id}/edit`}
              className={buttonVariants({
                size: "sm",
              })}
            >
              <Pencil className="size-4" />
              Edit shortlink
            </Link>
          ) : undefined
        }
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="min-w-0 space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="mb-6">
              <Typography as="h2" variant="h3">
                Shortlink details
              </Typography>

              <Typography variant="muted" className="mt-1">
                Destination and lifecycle information.
              </Typography>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <DetailField label="Slug">
                <span className="font-mono">/{shortlink.slug}</span>
              </DetailField>

              <DetailField label="Status">
                <SemanticBadge
                  type={getShortlinkStatusBadgeType(shortlink.status)}
                />
              </DetailField>

              <DetailField label="Media type">
                <SemanticBadge
                  type={getShortlinkMediaBadgeType(shortlink.mediaType)}
                />
              </DetailField>

              <DetailField
                label="Destination URL"
                className="sm:col-span-2 xl:col-span-3"
              >
                <a
                  href={shortlink.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 text-primary hover:underline"
                >
                  <span className="truncate">{shortlink.destinationUrl}</span>

                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
              </DetailField>

              <DetailField
                label="Title"
                className="sm:col-span-2 xl:col-span-3"
              >
                {shortlink.title}
              </DetailField>

              <DetailField
                label="Description"
                className="sm:col-span-2 xl:col-span-3"
              >
                {shortlink.description ? (
                  <span className="leading-6">{shortlink.description}</span>
                ) : (
                  <span className="text-muted-foreground">
                    No description provided.
                  </span>
                )}
              </DetailField>

              <DetailField label="Created">
                {formatDateTime(shortlink.createdAt)}
              </DetailField>

              <DetailField label="Last updated">
                {formatDateTime(shortlink.updatedAt)}
              </DetailField>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-6">
              <Typography as="h2" variant="h3">
                Media metadata
              </Typography>

              <Typography variant="muted" className="mt-1">
                Trusted metadata inspected by Nexora Core.
              </Typography>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <DetailField label="Dimensions">
                {shortlink.mediaWidth} × {shortlink.mediaHeight}
              </DetailField>

              <DetailField label="Display duration">
                {formatShortlinkDisplayDuration(shortlink.displayDurationMs)}
              </DetailField>

              <DetailField label="Original duration">
                {shortlink.mediaType === "VIDEO"
                  ? formatShortlinkDuration(shortlink.durationMs)
                  : "—"}
              </DetailField>

              <DetailField label="File size">
                {formatShortlinkBytes(shortlink.contentLength)}
              </DetailField>

              <DetailField label="MIME type">
                {shortlink.mimeType ?? "—"}
              </DetailField>

              <DetailField
                label="Media URL"
                className="sm:col-span-2 xl:col-span-3"
              >
                <a
                  href={shortlink.mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 text-primary hover:underline"
                >
                  <span className="truncate">{shortlink.mediaUrl}</span>

                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
              </DetailField>

              <DetailField
                label="Poster URL"
                className="sm:col-span-2 xl:col-span-3"
              >
                {shortlink.posterUrl ? (
                  <a
                    href={shortlink.posterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex max-w-full items-center gap-1.5 text-primary hover:underline"
                  >
                    <span className="truncate">{shortlink.posterUrl}</span>

                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">No poster URL.</span>
                )}
              </DetailField>
            </div>
          </Card>
        </div>

        <div className="min-w-0">
          <ShortlinkPreview
            slug={shortlink.slug}
            title={shortlink.title}
            description={shortlink.description ?? ""}
            mediaType={shortlink.mediaType}
            mediaUrl={shortlink.mediaUrl}
            posterUrl={shortlink.posterUrl ?? ""}
            displayDurationMs={shortlink.displayDurationMs}
            status={shortlink.status}
            mediaWidth={shortlink.mediaWidth}
            mediaHeight={shortlink.mediaHeight}
            durationMs={shortlink.durationMs}
            mimeType={shortlink.mimeType}
            contentLength={shortlink.contentLength}
            sticky
          />
        </div>
      </div>
    </div>
  );
}
