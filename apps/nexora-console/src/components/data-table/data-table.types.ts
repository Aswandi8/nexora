import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFilter {
  param: string;
  label: string;
  options: DataTableFilterOption[];
}

export type DataTableTransition = (action: () => void | Promise<void>) => void;

export interface DataTableActionContext {
  isPending: boolean;
  startTransition: DataTableTransition;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  getRowKey: (item: T) => string;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  pageSizeOptions?: number[];
  emptyTitle?: string;
  emptyDescription?: string;
  externalPending?: boolean;
  renderActions?: (item: T, context: DataTableActionContext) => ReactNode;
}
