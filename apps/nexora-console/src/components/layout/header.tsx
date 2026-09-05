"use client";

import type { AdminSession } from "@nexora/contracts/auth";

import { Menu } from "lucide-react";

import { AccountMenu } from "@/components/layout/account-menu";
import { NotificationButton } from "@/components/layout/notification-button";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  session: AdminSession;
  onOpenMobileSidebar: () => void;
}

export function Header({ session, onOpenMobileSidebar }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground sm:px-5 lg:px-6">
      <div className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          aria-controls="mobile-navigation"
          onClick={onOpenMobileSidebar}
          className="text-sidebar-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationButton />

        <AccountMenu session={session} />
      </div>
    </header>
  );
}
