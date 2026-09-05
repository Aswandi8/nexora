"use client";

import type { ReactNode } from "react";

import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableActionsProps {
  label?: string;
  children: ReactNode;
}

export function DataTableActions({
  label = "Open actions",
  children,
}: DataTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-foreground"
        >
          <MoreHorizontal className="size-4.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
