"use client";

import {
  ChevronDown,
  KeyRound,
  LayoutDashboard,
  Link2,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";

import type {
  NavigationGroup,
  NavigationIcon,
  NavigationItem,
} from "@/config/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavProps {
  groups: NavigationGroup[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

type NavigationIconComponent = ComponentType<{
  className?: string;
}>;

const navigationIcons: Record<NavigationIcon, NavigationIconComponent> = {
  dashboard: LayoutDashboard,
  shortlinks: Link2,
  users: Users,
  roles: ShieldCheck,
  permissions: KeyRound,
  settings: Settings,
};

function isPathActive(pathname: string, href?: string): boolean {
  if (!href) {
    return false;
  }

  if (pathname === href) {
    return true;
  }

  if (href === "/dashboard") {
    return false;
  }

  return pathname.startsWith(`${href}/`);
}

function hasActiveChild(pathname: string, item: NavigationItem): boolean {
  return Boolean(
    item.children?.some((child) => isPathActive(pathname, child.href)),
  );
}

export function SidebarNav({
  groups,
  collapsed = false,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  function toggleItem(title: string) {
    setExpandedItems((current) => ({
      ...current,
      [title]: !current[title],
    }));
  }

  return (
    <nav aria-label="Main navigation" className="grid gap-6">
      {groups.map((group) => (
        <div key={group.title} className="grid gap-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {group.title}
            </p>
          )}

          <div className="grid gap-1">
            {group.items.map((item) => {
              const Icon = navigationIcons[item.icon];

              const active =
                isPathActive(pathname, item.href) ||
                hasActiveChild(pathname, item);

              const hasChildren = Boolean(item.children?.length);

              const expanded =
                expandedItems[item.title] ?? hasActiveChild(pathname, item);

              if (hasChildren && !collapsed) {
                return (
                  <div key={item.title}>
                    <button
                      type="button"
                      onClick={() => toggleItem(item.title)}
                      className={cn(
                        "group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                        active &&
                          "bg-sidebar-accent text-brand-700 dark:text-brand-300",
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-500 shadow-[0_0_10px_var(--brand-400)]"
                        />
                      )}

                      <Icon
                        className={cn(
                          "size-4.5 shrink-0 transition-colors group-hover:text-foreground",
                          active && "text-brand-700 dark:text-brand-300",
                        )}
                      />

                      <span className="min-w-0 flex-1 truncate text-left">
                        {item.title}
                      </span>

                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "size-4 shrink-0 transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>

                    {expanded && (
                      <div className="ml-5 mt-1 grid gap-1 border-l border-sidebar-border pl-4">
                        {item.children?.map((child) => {
                          const childActive = isPathActive(
                            pathname,
                            child.href,
                          );

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onNavigate}
                              className={cn(
                                "relative flex min-h-9 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                                childActive &&
                                  "font-medium text-brand-700 dark:text-brand-300",
                              )}
                            >
                              {childActive && (
                                <span
                                  aria-hidden="true"
                                  className="absolute left-[-1.08rem] size-1.5 rounded-full bg-brand-500"
                                />
                              )}

                              {child.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.href) {
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.title : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-10 items-center rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                      collapsed ? "justify-center px-0" : "gap-3 px-3",
                      active &&
                        "bg-sidebar-accent text-brand-700 dark:text-brand-300",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-500 shadow-[0_0_10px_var(--brand-400)]"
                      />
                    )}

                    <Icon
                      className={cn(
                        "size-4.5 shrink-0 transition-colors group-hover:text-foreground",
                        active && "text-brand-700 dark:text-brand-300",
                      )}
                    />

                    {!collapsed && (
                      <span className="min-w-0 flex-1 truncate">
                        {item.title}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <button
                  key={item.title}
                  type="button"
                  disabled
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    "flex h-10 w-full items-center rounded-xl text-sm font-medium text-muted-foreground/55",
                    collapsed ? "justify-center px-0" : "gap-3 px-3",
                  )}
                >
                  <Icon className="size-4.5 shrink-0" />

                  {!collapsed && (
                    <span className="min-w-0 flex-1 truncate text-left">
                      {item.title}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
