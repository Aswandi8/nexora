import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "body-sm"
  | "muted"
  | "label"
  | "eyebrow";

const variants: Record<TypographyVariant, string> = {
  display: "text-4xl font-semibold tracking-tight text-foreground sm:text-5xl",
  h1: "text-3xl font-semibold tracking-tight text-foreground",
  h2: "text-2xl font-semibold tracking-tight text-foreground",
  h3: "text-xl font-semibold tracking-tight text-foreground",
  h4: "text-base font-semibold text-foreground",
  body: "text-sm leading-6 text-foreground",
  "body-sm": "text-sm leading-5 text-foreground",
  muted: "text-sm leading-5 text-muted-foreground",
  label: "text-sm font-medium leading-none text-foreground",
  eyebrow:
    "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground",
};

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TypographyVariant;
  children: ReactNode;
}

export function Typography({
  as: Component = "p",
  variant = "body",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component className={cn(variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}
