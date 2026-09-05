"use client";

import { Search, X } from "lucide-react";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { DataTableFilter, DataTableTransition } from "./data-table.types";

interface DataTableToolbarProps {
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  pageSizeOptions?: number[];
  isPending: boolean;
  startTransition: DataTableTransition;
}

export function DataTableToolbar({
  searchPlaceholder = "Search...",
  filters = [],
  pageSizeOptions = [10, 20, 50, 100],
  isPending,
  startTransition,
}: DataTableToolbarProps) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";

  const currentLimit = searchParams.get("limit") ?? "20";

  const [search, setSearch] = useState(currentSearch);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestSearchRef = useRef(currentSearch);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.set("page", "1");

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    setSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const normalized = value.trim();

    if (normalized === latestSearchRef.current) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      latestSearchRef.current = normalized;

      navigate({
        search: normalized || null,
      });
    }, 350);
  }

  function handleSearchClear() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setSearch("");

    latestSearchRef.current = "";

    navigate({
      search: null,
    });
  }

  function handleFilterChange(param: string, value: string) {
    navigate({
      [param]: value,
    });
  }

  function handlePageSizeChange(value: string) {
    navigate({
      limit: value,
    });
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative w-full sm:max-w-sm">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          autoComplete="off"
          disabled={isPending}
          className="pr-9 pl-9"
        />

        {search ? (
          <button
            type="button"
            onClick={handleSearchClear}
            disabled={isPending}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const selectedValue = searchParams.get(filter.param) ?? "all";

            return (
              <Select
                key={filter.param}
                value={selectedValue}
                disabled={isPending}
                onValueChange={(value) =>
                  handleFilterChange(filter.param, value)
                }
              >
                <SelectTrigger
                  aria-label={filter.label}
                  className="w-auto min-w-32 max-w-52 text-muted-foreground"
                >
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>

                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}
        </div>

        <div className="shrink-0">
          <Select
            value={currentLimit}
            disabled={isPending}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger
              aria-label={`Rows per page: ${currentLimit}`}
              className="w-auto min-w-20 text-muted-foreground sm:min-w-40"
            >
              <span className="hidden sm:inline">Rows:</span>

              <SelectValue />
            </SelectTrigger>

            <SelectContent align="end">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
