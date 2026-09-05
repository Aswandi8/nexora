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

export const shortlinkSchema = z.object({
  id: z.string(),
  slug: z.string().min(1).max(100),
  destinationUrl: z.string().url(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  mediaType: shortlinkMediaTypeSchema,
  mediaUrl: z.string().url(),
  posterUrl: z.string().url().nullable(),
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

export const createShortlinkSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers, and hyphens.",
    ),

  destinationUrl: z.string().trim().url(),

  title: z.string().trim().min(1).max(255),

  description: z.string().trim().max(1000).nullable().optional(),

  mediaType: shortlinkMediaTypeSchema,

  mediaUrl: z.string().trim().url(),

  posterUrl: z
    .union([z.string().trim().url(), z.literal("")])
    .nullable()
    .optional()
    .transform((value) => value || null),

  displayDurationMs: displayDurationMsSchema,

  status: shortlinkStatusSchema.default("ACTIVE"),
});

export const updateShortlinkSchema = createShortlinkSchema.partial();

export type Shortlink = z.infer<typeof shortlinkSchema>;
export type ShortlinkListQuery = z.infer<typeof shortlinkListQuerySchema>;
export type ShortlinkStatusFilter = z.infer<typeof shortlinkStatusFilterSchema>;

export type ShortlinkMediaTypeFilter = z.infer<
  typeof shortlinkMediaTypeFilterSchema
>;

export type CreateShortlinkInput = z.infer<typeof createShortlinkSchema>;
export type UpdateShortlinkInput = z.infer<typeof updateShortlinkSchema>;
