"use client";

import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-9 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-secondary data-[state=open]:text-foreground"
        >
          <Bell aria-hidden="true" className="size-4.5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">Notifications</p>
        </div>

        <div className="border-t border-border px-4 py-8 text-center">
          <span className="mx-auto mb-3 flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Bell aria-hidden="true" className="size-4" />
          </span>

          <p className="text-sm font-medium text-foreground">
            No notifications
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            New notifications will appear here.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
