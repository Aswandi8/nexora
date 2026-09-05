export const SHORTLINK_MEDIA_TYPES = ["IMAGE", "VIDEO"] as const;
export const SHORTLINK_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type ShortlinkMediaType = (typeof SHORTLINK_MEDIA_TYPES)[number];
export type ShortlinkStatus = (typeof SHORTLINK_STATUSES)[number];
