import type { ReactNode } from "react";

import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/components/navigation/breadcrumb";

import { Typography } from "@/components/ui/typography";

import { cn } from "@/lib/utils";

interface PageHeaderCardProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeaderCard({
  breadcrumbs,
  title,
  description,
  actions,
  className,
}: PageHeaderCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card px-5 py-5 text-card-foreground shadow-sm sm:px-6 sm:py-6",
        className,
      )}
    >
      <div className="flex flex-col">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Breadcrumb items={breadcrumbs} className="min-w-0" />

          {actions ? (
            <div className="flex shrink-0 items-center">{actions}</div>
          ) : null}
        </div>

        <div aria-hidden="true" className="mt-5 h-px w-full bg-border" />

        <div className="mt-5 min-w-0">
          <Typography as="h1" variant="h1" className="text-2xl sm:text-3xl">
            {title}
          </Typography>

          {description ? (
            <Typography variant="muted" className="mt-1.5 max-w-3xl">
              {description}
            </Typography>
          ) : null}
        </div>
      </div>
    </section>
  );
}
