import type { ComponentProps } from "react";

import type { Badge } from "@/components/ui/badge";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

export interface BadgeConfig {
  label: string;
  variant: BadgeVariant;
}

export const BADGE_CONFIG = {
  // User status
  "user.active": {
    label: "Active",
    variant: "success",
  },

  "user.inactive": {
    label: "Inactive",
    variant: "secondary",
  },

  "user.suspended": {
    label: "Suspended",
    variant: "warning",
  },

  // System roles
  "role.super_admin": {
    label: "Super Admin",
    variant: "brand1",
  },

  "role.admin": {
    label: "Admin",
    variant: "brand2",
  },

  "role.manager": {
    label: "Manager",
    variant: "brand3",
  },

  "role.operator": {
    label: "Operator",
    variant: "brand4",
  },

  "role.viewer": {
    label: "Viewer",
    variant: "brand5",
  },

  // Unknown/custom role fallback
  "role.custom": {
    label: "Custom",
    variant: "outline",
  },

  // Role type
  "role.type.system": {
    label: "System",
    variant: "brand1",
  },

  "role.type.custom": {
    label: "Custom",
    variant: "secondary",
  },

  // Shortlink status
  "shortlink.active": {
    label: "Active",
    variant: "success",
  },

  "shortlink.inactive": {
    label: "Inactive",
    variant: "secondary",
  },

  // Shortlink media
  "shortlink.media.image": {
    label: "Image",
    variant: "brand2",
  },

  "shortlink.media.video": {
    label: "Video",
    variant: "brand3",
  },

  // Generic
  "generic.protected": {
    label: "Protected",
    variant: "outline",
  },

  "generic.enabled": {
    label: "Enabled",
    variant: "success",
  },

  "generic.disabled": {
    label: "Disabled",
    variant: "secondary",
  },

  // Verification
  "verification.verified": {
    label: "Verified",
    variant: "success",
  },

  "verification.unverified": {
    label: "Unverified",
    variant: "secondary",
  },

  // Generic lifecycle
  "status.pending": {
    label: "Pending",
    variant: "warning",
  },

  "status.archived": {
    label: "Archived",
    variant: "secondary",
  },

  "status.revoked": {
    label: "Revoked",
    variant: "destructive",
  },
} as const satisfies Record<string, BadgeConfig>;

export type BadgeType = keyof typeof BADGE_CONFIG;

function formatBadgeLabel(value: string): string {
  return value
    .trim()
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getBadgeConfig(
  type: string,
  fallbackLabel?: string,
): BadgeConfig {
  const config = BADGE_CONFIG[type as BadgeType];

  if (config) {
    return config;
  }

  return {
    label: fallbackLabel
      ? formatBadgeLabel(fallbackLabel)
      : formatBadgeLabel(type),

    variant: "outline",
  };
}

export function getUserStatusBadgeType(status: string): BadgeType {
  switch (status.trim().toUpperCase()) {
    case "ACTIVE":
      return "user.active";

    case "INACTIVE":
      return "user.inactive";

    case "SUSPENDED":
      return "user.suspended";

    default:
      return "generic.disabled";
  }
}

export function getRoleBadgeType(code: string): BadgeType {
  switch (code.trim().toUpperCase()) {
    case "SUPER_ADMIN":
      return "role.super_admin";

    case "ADMIN":
      return "role.admin";

    case "MANAGER":
      return "role.manager";

    case "OPERATOR":
      return "role.operator";

    case "VIEWER":
      return "role.viewer";

    default:
      return "role.custom";
  }
}

export function getRoleTypeBadgeType(isSystem: boolean): BadgeType {
  return isSystem ? "role.type.system" : "role.type.custom";
}

export function getShortlinkStatusBadgeType(status: string): BadgeType {
  return status.trim().toUpperCase() === "ACTIVE"
    ? "shortlink.active"
    : "shortlink.inactive";
}

export function getShortlinkMediaBadgeType(mediaType: string): BadgeType {
  return mediaType.trim().toUpperCase() === "VIDEO"
    ? "shortlink.media.video"
    : "shortlink.media.image";
}
