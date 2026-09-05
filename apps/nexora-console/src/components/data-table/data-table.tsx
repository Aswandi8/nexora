"use client";

import { useTransition } from "react";

import { Card } from "@/components/ui/card";

import { DataTablePagination } from "./data-table-pagination";

import { DataTableToolbar } from "./data-table-toolbar";

import type { DataTableProps } from "./data-table.types";

export function DataTable<T>({
  data,
  columns,
  pagination,
  getRowKey,
  searchPlaceholder,
  filters,
  pageSizeOptions,
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display.",
  renderActions,
}: DataTableProps<T>) {
  const [isPending, startTransition] = useTransition();

  const skeletonRows =
    data.length > 0 ? data.length : Math.min(pagination.limit, 5);

  return (
    <div className="w-full min-w-0 max-w-full">
      <Card className="w-full min-w-0 max-w-full overflow-hidden">
        <div className="min-w-0 p-4">
          <DataTableToolbar
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            pageSizeOptions={pageSizeOptions}
            isPending={isPending}
            startTransition={startTransition}
          />
        </div>

        <div className="w-full min-w-0 max-w-full border-t border-border">
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-720px border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className={`h-11 whitespace-nowrap px-4 text-left text-xs font-medium text-muted-foreground ${
                        column.headerClassName ?? ""
                      }`}
                    >
                      {column.header}
                    </th>
                  ))}

                  {renderActions ? (
                    <th className="h-11 w-20 min-w-20 whitespace-nowrap px-4 text-right text-xs font-medium text-muted-foreground">
                      Action
                    </th>
                  ) : null}
                </tr>
              </thead>

              <tbody>
                {isPending ? (
                  Array.from({
                    length: skeletonRows,
                  }).map((_, rowIndex) => (
                    <tr
                      key={`skeleton-${rowIndex}`}
                      className="border-b border-border last:border-b-0"
                    >
                      {columns.map((column, columnIndex) => (
                        <td key={column.id} className="px-4 py-4">
                          <div
                            className={`h-4 animate-pulse rounded bg-secondary ${
                              columnIndex === 0 ? "w-40" : "w-16"
                            }`}
                          />
                        </td>
                      ))}

                      {renderActions ? (
                        <td className="w-20 min-w-20 px-4 py-4">
                          <div className="ml-auto size-7 animate-pulse rounded-md bg-secondary" />
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : data.length > 0 ? (
                  data.map((item) => (
                    <tr
                      key={getRowKey(item)}
                      className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/40"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={`px-4 py-3 ${column.className ?? ""}`}
                        >
                          {column.cell(item)}
                        </td>
                      ))}

                      {renderActions ? (
                        <td className="w-20 min-w-20 px-4 py-3">
                          <div className="flex justify-end">
                            {renderActions(item, {
                              isPending,
                              startTransition,
                            })}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (renderActions ? 1 : 0)}
                      className="px-4 py-14 text-center"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {emptyTitle}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {emptyDescription}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 border-t border-border px-4 py-3">
          <DataTablePagination
            pagination={pagination}
            isPending={isPending}
            startTransition={startTransition}
          />
        </div>
      </Card>
    </div>
  );
}
