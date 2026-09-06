import { z } from "zod";

import {
  SHORTLINK_MEDIA_TYPES,
  SHORTLINK_STATUSES,
} from "./shortlink.constants";

export const shortlinkMediaTypeSchema = z.enum(SHORTLINK_MEDIA_TYPES);
export const shortlinkStatusSchema = z.enum(SHORTLINK_STATUSES);

export const DISPLAY_DURATION_MIN_MS = 1_000;
export const DISPLAY_DURATION_MAX_MS = 59 * 60_000 + 59 * 1_000;

export const displayDurationMsSchema = z
  .number()
  .int()
  .min(DISPLAY_DURATION_MIN_MS, "Display duration must be at least 00:01.")
  .max(DISPLAY_DURATION_MAX_MS, "Display duration cannot exceed 59:59.");

export const durationPartSchema = z.number().int().min(0).max(59);

export const shortlinkSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug may only contain lowercase letters, numbers, and hyphens.",
  );

export const httpUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) => {
      try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    {
      message: "URL must use HTTP or HTTPS.",
    },
  );

export const shortlinkSchema = z.object({
  id: z.string(),
  slug: shortlinkSlugSchema,
  destinationUrl: httpUrlSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  mediaType: shortlinkMediaTypeSchema,
  mediaUrl: httpUrlSchema,
  posterUrl: httpUrlSchema.nullable(),
  mediaWidth: z.number().int().positive(),
  mediaHeight: z.number().int().positive(),
  durationMs: z.number().int().nonnegative().nullable(),
  displayDurationMs: displayDurationMsSchema,
  mimeType: z.string().nullable(),
  contentLength: z.string().nullable(),
  status: shortlinkStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const shortlinkStatusFilterSchema = z.enum([
  "all",
  ...SHORTLINK_STATUSES,
]);

export const shortlinkMediaTypeFilterSchema = z.enum([
  "all",
  ...SHORTLINK_MEDIA_TYPES,
]);

export const shortlinkListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).default(""),
  status: shortlinkStatusFilterSchema.default("all"),
  mediaType: shortlinkMediaTypeFilterSchema.default("all"),
});

const shortlinkWriteFields = {
  slug: shortlinkSlugSchema,
  destinationUrl: httpUrlSchema,
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(1000).nullable().optional(),
  mediaUrl: httpUrlSchema,
  displayDurationMs: displayDurationMsSchema,
  status: shortlinkStatusSchema.default("ACTIVE"),
};

export const createShortlinkSchema = z.object(shortlinkWriteFields);
export const updateShortlinkSchema = z.object(shortlinkWriteFields).partial();

export type Shortlink = z.infer<typeof shortlinkSchema>;
export type ShortlinkListQuery = z.infer<typeof shortlinkListQuerySchema>;
export type ShortlinkStatusFilter = z.infer<typeof shortlinkStatusFilterSchema>;
export type ShortlinkMediaTypeFilter = z.infer<
  typeof shortlinkMediaTypeFilterSchema
>;
export type CreateShortlinkInput = z.infer<typeof createShortlinkSchema>;
export type UpdateShortlinkInput = z.infer<typeof updateShortlinkSchema>;
