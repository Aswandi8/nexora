"use client";

import { useEffect } from "react";

import type { AdminSession } from "@nexora/contracts/auth";

import { X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";

import { getNavigationGroups } from "@/config/navigation";

interface MobileSidebarProps {
  session: AdminSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({
  session,
  open,
  onOpenChange,
}: MobileSidebarProps) {
  const groups = getNavigationGroups(session.permissions);

  const initial = session.user.name.trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-[1px] lg:hidden"
      />

      <aside
        id="mobile-navigation"
        className="fixed inset-y-0 left-0 z-60 flex h-dvh w-[min(86vw,18rem)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl lg:hidden"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <Logo priority width={160} height={48} className="h-auto w-32" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={() => onOpenChange(false)}
            className="size-8 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="nexora-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <SidebarNav groups={groups} onNavigate={() => onOpenChange(false)} />
        </div>

        <div className="shrink-0 border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
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
          </div>
        </div>
      </aside>
    </>
  );
}
