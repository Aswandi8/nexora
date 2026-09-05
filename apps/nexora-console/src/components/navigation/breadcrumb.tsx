import { ChevronRight, Home } from "lucide-react";

import Link from "next/link";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        <li className="flex shrink-0 items-center">
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            title="Dashboard"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Home aria-hidden="true" className="size-3.5" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-1"
            >
              <ChevronRight
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground/45"
              />

              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="truncate rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "truncate px-1.5 py-1",
                    isCurrent
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
