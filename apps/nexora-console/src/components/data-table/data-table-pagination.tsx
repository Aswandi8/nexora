"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import type { DataTableTransition } from "./data-table.types";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DataTablePaginationProps {
  pagination: PaginationMeta;
  isPending: boolean;
  startTransition: DataTableTransition;
}

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

function getPaginationItems(
  page: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  const items: PaginationItem[] = [1];

  const start = Math.max(2, page - 1);

  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) {
    items.push("ellipsis-start");
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis-end");
  }

  items.push(totalPages);

  return items;
}

export function DataTablePagination({
  pagination,
  isPending,
  startTransition,
}: DataTablePaginationProps) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const totalPages = Math.max(pagination.totalPages, 1);

  const page = Math.min(Math.max(pagination.page, 1), totalPages);

  const items = getPaginationItems(page, totalPages);

  function goToPage(targetPage: number) {
    if (
      isPending ||
      targetPage === page ||
      targetPage < 1 ||
      targetPage > totalPages
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(targetPage));

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  const navigationClass =
    "flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <nav
      aria-label="Table pagination"
      className="flex min-h-8 items-center justify-center gap-0.5"
    >
      <button
        type="button"
        aria-label="First page"
        disabled={isPending || page <= 1}
        onClick={() => goToPage(1)}
        className={navigationClass}
      >
        <ChevronsLeft aria-hidden="true" className="size-4" />
      </button>

      <button
        type="button"
        aria-label="Previous page"
        disabled={isPending || page <= 1}
        onClick={() => goToPage(page - 1)}
        className={navigationClass}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>

      {items.map((item) => {
        if (typeof item !== "number") {
          return (
            <span
              key={item}
              className="flex size-8 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          );
        }

        const active = item === page;

        return (
          <button
            key={item}
            type="button"
            aria-current={active ? "page" : undefined}
            disabled={isPending}
            onClick={() => goToPage(item)}
            className={cn(
              "flex size-8 items-center justify-center rounded-md text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              active
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Next page"
        disabled={isPending || page >= totalPages}
        onClick={() => goToPage(page + 1)}
        className={navigationClass}
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>

      <button
        type="button"
        aria-label="Last page"
        disabled={isPending || page >= totalPages}
        onClick={() => goToPage(totalPages)}
        className={navigationClass}
      >
        <ChevronsRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}
