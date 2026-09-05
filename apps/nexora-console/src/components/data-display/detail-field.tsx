import type { ReactNode } from "react";

import { Typography } from "@/components/ui/typography";

import { cn } from "@/lib/utils";

interface DetailFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function DetailField({ label, children, className }: DetailFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <Typography variant="eyebrow">{label}</Typography>

      <div className="mt-2 min-w-0 text-sm text-foreground">{children}</div>
    </div>
  );
}
