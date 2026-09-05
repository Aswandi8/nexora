import type { ComponentProps, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

import { getBadgeConfig, type BadgeType } from "@/config/badge.config";

interface SemanticBadgeProps extends Omit<
  ComponentProps<typeof Badge>,
  "variant" | "children"
> {
  type: BadgeType | string;

  label?: string;

  icon?: ReactNode;
}

export function SemanticBadge({
  type,
  label,
  icon,
  ...props
}: SemanticBadgeProps) {
  const config = getBadgeConfig(type, label);

  return (
    <Badge variant={config.variant} {...props}>
      {icon}

      {label ?? config.label}
    </Badge>
  );
}
