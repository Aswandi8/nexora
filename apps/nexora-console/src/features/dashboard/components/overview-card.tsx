import type { ComponentType } from "react";

import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

import { cn } from "@/lib/utils";

interface OverviewCardProps {
  title: string;
  value: number;
  description: string;
  href: string;
  icon: ComponentType<{
    className?: string;
  }>;
  className?: string;
}

export function OverviewCard({
  title,
  value,
  description,
  href,
  icon: Icon,
  className,
}: OverviewCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Card className="h-full p-5 transition-colors group-hover:bg-secondary sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors group-hover:text-foreground">
            <Icon aria-hidden="true" className="size-4.5" />
          </div>

          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-muted-foreground/60 transition-colors group-hover:text-foreground"
          />
        </div>

        <div className="mt-6">
          <Typography as="p" variant="eyebrow">
            {title}
          </Typography>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value.toLocaleString()}
          </p>

          <Typography variant="muted" className="mt-2">
            {description}
          </Typography>
        </div>
      </Card>
    </Link>
  );
}
