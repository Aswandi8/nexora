export const SHORTLINK_MEDIA_TYPES = ["IMAGE", "VIDEO"] as const;
export const SHORTLINK_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export const SHORTLINK_IMAGE_ASPECT_RATIO_WIDTH = 16;
export const SHORTLINK_IMAGE_ASPECT_RATIO_HEIGHT = 9;
export const SHORTLINK_IMAGE_ASPECT_RATIO_TOLERANCE = 0.02;

export type ShortlinkMediaType = (typeof SHORTLINK_MEDIA_TYPES)[number];
export type ShortlinkStatus = (typeof SHORTLINK_STATUSES)[number];
