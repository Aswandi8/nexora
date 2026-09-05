"use client";

import type { AdminSession } from "@nexora/contracts/auth";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";

import { getNavigationGroups } from "@/config/navigation";

import { cn } from "@/lib/utils";

interface SidebarProps {
  session: AdminSession;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({
  session,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const groups = getNavigationGroups(session.permissions);

  const initial = session.user.name.trim().charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "hidden h-dvh shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {collapsed ? (
          <button
            type="button"
            aria-label="Expand sidebar"
            title="Expand sidebar"
            onClick={() => onCollapsedChange(false)}
            className="group relative flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-sidebar-accent"
          >
            <Logo
              variant="brand"
              priority
              width={40}
              height={40}
              className="size-8 object-contain transition-all duration-150 group-hover:scale-75 group-hover:opacity-0"
            />

            <ChevronRight
              aria-hidden="true"
              className="absolute size-5 scale-75 text-muted-foreground opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:text-foreground group-hover:opacity-100"
            />
          </button>
        ) : (
          <>
            <Logo priority width={160} height={54} className="h-auto w-32" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              onClick={() => onCollapsedChange(true)}
              className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </>
        )}
      </div>

      <div
        className={cn(
          "nexora-scrollbar min-h-0 flex-1 overflow-y-auto py-5",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <SidebarNav groups={groups} collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border",
          collapsed ? "p-2" : "p-3",
        )}
      >
        {collapsed ? (
          <button
            type="button"
            title={session.user.name}
            className="flex size-11 w-full items-center justify-center rounded-xl transition-colors hover:bg-sidebar-accent"
          >
            <span className="flex size-8 items-center justify-center rounded-full border border-brand-500/35 bg-brand-500/10 text-xs font-semibold text-brand-700 dark:text-brand-300">
              {initial}
            </span>
          </button>
        ) : (
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-500/35 bg-brand-500/10 text-xs font-semibold text-brand-700 dark:text-brand-300">
              {initial}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-sidebar-foreground">
                {session.user.name}
              </span>

              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" />
                Active
              </span>
            </span>

            <span
              aria-hidden="true"
              className="text-lg leading-none text-muted-foreground"
            >
              ⋮
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
