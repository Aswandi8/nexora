import type { ComponentType } from "react";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{
    className?: string;
  }>;
}

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full items-center gap-4 p-4 transition-colors group-hover:bg-secondary sm:p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors group-hover:text-foreground">
          <Icon aria-hidden="true" className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <Typography
            as="p"
            variant="body-sm"
            className="font-medium text-foreground"
          >
            {title}
          </Typography>

          <Typography variant="muted" className="mt-1">
            {description}
          </Typography>
        </div>

        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </Card>
    </Link>
  );
}
