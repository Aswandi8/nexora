"use client";

import type { AdminSession } from "@nexora/contracts/auth";

import { ChevronDown, Settings, UserRound } from "lucide-react";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "@/components/ui/theme-toggle";

import { LogoutButton } from "@/features/auth/logout-button";

interface AccountMenuProps {
  session: AdminSession;
}

export function AccountMenu({ session }: AccountMenuProps) {
  const initial = session.user.name.trim().charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="group flex items-center gap-2 rounded-xl p-1 outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring sm:gap-2.5 sm:pl-2.5"
        >
          <span className="hidden max-w-36 truncate text-sm font-medium text-foreground sm:block">
            {session.user.name}
          </span>

          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-500/35 bg-brand-500/10 text-xs font-semibold text-brand-700 transition-colors group-hover:border-foreground/20 dark:text-brand-300">
            {initial}
          </span>

          <ChevronDown
            aria-hidden="true"
            className="hidden size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 sm:block"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-2.5 py-2.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-500/35 bg-brand-500/10 text-sm font-semibold text-brand-700 dark:text-brand-300">
            {initial}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {session.user.name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {session.user.email}
            </p>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              Active
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserRound className="size-4" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <div className="p-0.5">
          <ThemeToggle />
        </div>

        <DropdownMenuSeparator />

        <div className="p-0.5">
          <LogoutButton variant="menu" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
