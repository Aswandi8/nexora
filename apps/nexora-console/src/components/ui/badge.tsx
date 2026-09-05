import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium leading-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary",

        secondary: "border-border bg-secondary text-secondary-foreground",

        outline: "border-border bg-transparent text-muted-foreground",

        destructive: "border-destructive/30 bg-destructive/10 text-destructive",

        success: "border-success/30 bg-success/10 text-success",

        warning: "border-warning/30 bg-warning/10 text-warning",

        brand1:
          "border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300",

        brand2:
          "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",

        brand3:
          "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",

        brand4:
          "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",

        brand5:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",

        brand6:
          "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",

        brand7:
          "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300",

        brand8:
          "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
      },
    },

    defaultVariants: {
      variant: "secondary",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({
          variant,
        }),
        className,
      )}
      {...props}
    />
  );
}

export { badgeVariants };

export type { BadgeProps };
