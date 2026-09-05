"use client";

import type { PaginatedResult, Shortlink } from "@nexora/contracts";

import { Copy, Eye, Pencil, Share2 } from "lucide-react";

import Link from "next/link";

import { useState, useTransition } from "react";

import { DataTable } from "@/components/data-table/data-table";

import { DataTableActions } from "@/components/data-table/data-table-actions";

import type {
  DataTableColumn,
  DataTableFilter,
} from "@/components/data-table/data-table.types";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { SemanticBadge } from "@/components/ui/semantic-badge";

import { getShortlinkStatusBadgeType } from "@/config/badge.config";

import { useToast } from "@/hooks/use-toast";

import { DeleteShortlinkButton } from "./delete-shortlink-button";

import { ShortlinkStatusDialog } from "./shortlink-status-dialog";

interface ShortlinksListProps {
  shortlinks: Shortlink[];
  pagination: PaginatedResult<Shortlink>["pagination"];
  publicBaseUrl: string;
  canUpdate: boolean;
  canDelete: boolean;
}

const filters: DataTableFilter[] = [
  {
    param: "status",
    label: "Status",
    options: [
      {
        label: "All statuses",
        value: "all",
      },
      {
        label: "Active",
        value: "ACTIVE",
      },
      {
        label: "Inactive",
        value: "INACTIVE",
      },
    ],
  },
];

function createPublicShortlinkUrl(publicBaseUrl: string, slug: string): string {
  const baseUrl = publicBaseUrl.endsWith("/")
    ? publicBaseUrl
    : `${publicBaseUrl}/`;

  return new URL(`watch/${encodeURIComponent(slug)}`, baseUrl).toString();
}

export function ShortlinksList({
  shortlinks,
  pagination,
  publicBaseUrl,
  canUpdate,
  canDelete,
}: ShortlinksListProps) {
  const { toast } = useToast();

  const [activeShortlink, setActiveShortlink] = useState<Shortlink | null>(
    null,
  );

  const [mutationPending, startMutationTransition] = useTransition();

  async function copyPublicLink(shortlink: Shortlink) {
    const publicUrl = createPublicShortlinkUrl(publicBaseUrl, shortlink.slug);

    try {
      await navigator.clipboard.writeText(publicUrl);

      toast({
        title: "Link copied",
        description: "The public shortlink has been copied to your clipboard.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Unable to copy the public shortlink.",
        variant: "destructive",
      });
    }
  }

  function shareToX(shortlink: Shortlink) {
    const publicUrl = createPublicShortlinkUrl(publicBaseUrl, shortlink.slug);

    const intentUrl = new URL("https://x.com/intent/post");

    intentUrl.searchParams.set("text", shortlink.title);
    intentUrl.searchParams.set("url", publicUrl);

    window.open(
      intentUrl.toString(),
      "_blank",
      "noopener,noreferrer,width=720,height=640",
    );
  }

  const columns: DataTableColumn<Shortlink>[] = [
    {
      id: "shortlink",
      header: "Shortlink",
      cell: (shortlink) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {shortlink.title}
          </p>

          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
            /{shortlink.slug}
          </p>
        </div>
      ),
    },

    {
      id: "status",
      header: "Status",
      cell: (shortlink) => {
        if (!canUpdate) {
          return (
            <SemanticBadge
              type={getShortlinkStatusBadgeType(shortlink.status)}
            />
          );
        }

        return (
          <button
            type="button"
            aria-label={`Ubah status ${shortlink.title}`}
            disabled={mutationPending}
            onClick={() => setActiveShortlink(shortlink)}
            className="rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
          >
            <SemanticBadge
              type={getShortlinkStatusBadgeType(shortlink.status)}
              className="cursor-pointer"
            />
          </button>
        );
      },
    },

    {
      id: "destination",
      header: "Destination",
      cell: (shortlink) => (
        <span
          title={shortlink.destinationUrl}
          className="block max-w-72 truncate text-sm text-muted-foreground"
        >
          {shortlink.destinationUrl}
        </span>
      ),
    },

    {
      id: "created",
      header: "Created",
      cell: (shortlink) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
          }).format(new Date(shortlink.createdAt))}
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={shortlinks}
        columns={columns}
        pagination={pagination}
        getRowKey={(shortlink) => shortlink.id}
        searchPlaceholder="Search shortlinks..."
        filters={filters}
        pageSizeOptions={[10, 20, 50, 100]}
        emptyTitle="No shortlinks found"
        emptyDescription="No shortlinks match the current search or filters."
        externalPending={mutationPending}
        renderActions={(shortlink, { isPending, startTransition }) => (
          <DataTableActions label={`Actions for ${shortlink.title}`}>
            <DropdownMenuItem asChild>
              <Link href={`/shortlinks/${shortlink.id}`}>
                <Eye className="size-4" />
                <span>View details</span>
              </Link>
            </DropdownMenuItem>

            {canUpdate ? (
              <DropdownMenuItem asChild>
                <Link href={`/shortlinks/${shortlink.id}/edit`}>
                  <Pencil className="size-4" />
                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => void copyPublicLink(shortlink)}>
              <Copy className="size-4" />
              <span>Copy link</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => shareToX(shortlink)}>
              <Share2 className="size-4" />
              <span>Share to X</span>
            </DropdownMenuItem>

            {canDelete ? <DropdownMenuSeparator /> : null}

            {canDelete ? (
              <DeleteShortlinkButton
                id={shortlink.id}
                title={shortlink.title}
                slug={shortlink.slug}
                isPending={isPending}
                startTransition={startTransition}
              />
            ) : null}
          </DataTableActions>
        )}
      />

      {activeShortlink ? (
        <ShortlinkStatusDialog
          key={activeShortlink.id}
          shortlink={activeShortlink}
          open
          pending={mutationPending}
          startTransition={startMutationTransition}
          onOpenChange={(open) => {
            if (!open && !mutationPending) {
              setActiveShortlink(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
