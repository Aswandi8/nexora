"use client";

import type { PaginatedResult, Shortlink } from "@nexora/contracts";

import { Eye, ImageIcon, Pencil, Video } from "lucide-react";

import Link from "next/link";

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

import {
  getShortlinkMediaBadgeType,
  getShortlinkStatusBadgeType,
} from "@/config/badge.config";

import { DeleteShortlinkButton } from "./delete-shortlink-button";

interface ShortlinksListProps {
  shortlinks: Shortlink[];
  pagination: PaginatedResult<Shortlink>["pagination"];
  canUpdate: boolean;
  canDelete: boolean;
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
    id: "media",

    header: "Media",

    cell: (shortlink) => (
      <SemanticBadge
        type={getShortlinkMediaBadgeType(shortlink.mediaType)}
        icon={
          shortlink.mediaType === "VIDEO" ? (
            <Video className="size-3" />
          ) : (
            <ImageIcon className="size-3" />
          )
        }
      />
    ),
  },

  {
    id: "status",

    header: "Status",

    cell: (shortlink) => (
      <SemanticBadge type={getShortlinkStatusBadgeType(shortlink.status)} />
    ),
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

  {
    param: "mediaType",

    label: "Media type",

    options: [
      {
        label: "All media",
        value: "all",
      },

      {
        label: "Image",
        value: "IMAGE",
      },

      {
        label: "Video",
        value: "VIDEO",
      },
    ],
  },
];

export function ShortlinksList({
  shortlinks,
  pagination,
  canUpdate,
  canDelete,
}: ShortlinksListProps) {
  return (
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
  );
}
