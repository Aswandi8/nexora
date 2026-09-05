import {
  createShortlinkSchema,
  shortlinkListQuerySchema,
  updateShortlinkSchema,
  type PaginatedResult,
  type Shortlink,
} from "@nexora/contracts";

import type { Prisma } from "@/generated/prisma/client";

import { inspectMediaUrl } from "@/integrations/media";

import { SHORTLINK_ERRORS } from "./shortlink.errors";
import { mapShortlink } from "./shortlink.mapper";
import { shortlinkRepository } from "./shortlink.repository";

export type UpdateShortlinkResult = {
  before: Shortlink;
  result: Shortlink;
};

function assertMediaType(
  expected: "IMAGE" | "VIDEO",
  actual: "IMAGE" | "VIDEO",
) {
  if (expected === actual) return;

  if (expected === "IMAGE") {
    throw new Error("The supplied media URL does not contain image media.");
  }

  throw new Error("The supplied media URL does not contain video media.");
}

export async function listShortlinks(
  input: unknown,
): Promise<PaginatedResult<Shortlink>> {
  const query = shortlinkListQuerySchema.parse(input);

  const where: Prisma.ShortlinkWhereInput = {
    ...(query.search
      ? {
          OR: [
            {
              slug: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              destinationUrl: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(query.status !== "all"
      ? {
          status: query.status,
        }
      : {}),
    ...(query.mediaType !== "all"
      ? {
          mediaType: query.mediaType,
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [shortlinks, total] = await Promise.all([
    shortlinkRepository.findMany({
      skip,
      take: query.limit,
      where,
    }),
    shortlinkRepository.count(where),
  ]);

  return {
    items: shortlinks.map(mapShortlink),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    },
  };
}

export async function createShortlink(input: unknown): Promise<Shortlink> {
  const data = createShortlinkSchema.parse(input);
  const inspected = await inspectMediaUrl(data.mediaUrl);

  assertMediaType(data.mediaType, inspected.mediaType);

  const shortlink = await shortlinkRepository.create({
    slug: data.slug,
    destinationUrl: data.destinationUrl,
    title: data.title,
    description: data.description ?? null,
    mediaType: data.mediaType,
    mediaUrl: data.mediaUrl,
    posterUrl: data.mediaType === "VIDEO" ? (data.posterUrl ?? null) : null,
    mediaWidth: inspected.mediaWidth,
    mediaHeight: inspected.mediaHeight,
    durationMs: data.mediaType === "VIDEO" ? inspected.durationMs : null,
    displayDurationMs: data.displayDurationMs,
    mimeType: inspected.mimeType,
    contentLength:
      inspected.contentLength === null ? null : BigInt(inspected.contentLength),
    status: data.status,
  });

  return mapShortlink(shortlink);
}

export async function updateShortlink(
  id: string,
  input: unknown,
): Promise<UpdateShortlinkResult> {
  const existing = await shortlinkRepository.findById(id);

  if (!existing) {
    throw new Error(SHORTLINK_ERRORS.NOT_FOUND);
  }

  const before = mapShortlink(existing);
  const data = updateShortlinkSchema.parse(input);

  const requestedMediaType = data.mediaType ?? existing.mediaType;
  const requestedMediaUrl = data.mediaUrl ?? existing.mediaUrl;

  const mediaChanged =
    requestedMediaType !== existing.mediaType ||
    requestedMediaUrl !== existing.mediaUrl;

  const updateData: Prisma.ShortlinkUpdateInput = {
    slug: data.slug,
    destinationUrl: data.destinationUrl,
    title: data.title,
    description: data.description,
    displayDurationMs: data.displayDurationMs,
    status: data.status,
  };

  if (requestedMediaType === "IMAGE") {
    updateData.posterUrl = null;
  } else if (data.posterUrl !== undefined) {
    updateData.posterUrl = data.posterUrl;
  }

  if (mediaChanged) {
    const inspected = await inspectMediaUrl(requestedMediaUrl);

    assertMediaType(requestedMediaType, inspected.mediaType);

    updateData.mediaType = requestedMediaType;
    updateData.mediaUrl = requestedMediaUrl;
    updateData.mediaWidth = inspected.mediaWidth;
    updateData.mediaHeight = inspected.mediaHeight;
    updateData.durationMs =
      requestedMediaType === "VIDEO" ? inspected.durationMs : null;
    updateData.mimeType = inspected.mimeType;
    updateData.contentLength =
      inspected.contentLength === null ? null : BigInt(inspected.contentLength);
  }

  const shortlink = await shortlinkRepository.update(id, updateData);

  return {
    before,
    result: mapShortlink(shortlink),
  };
}

export async function getShortlinkById(id: string): Promise<Shortlink> {
  const shortlink = await shortlinkRepository.findById(id);

  if (!shortlink) {
    throw new Error(SHORTLINK_ERRORS.NOT_FOUND);
  }

  return mapShortlink(shortlink);
}

export async function getShortlinkBySlug(slug: string): Promise<Shortlink> {
  const shortlink = await shortlinkRepository.findBySlug(slug);

  if (!shortlink) {
    throw new Error(SHORTLINK_ERRORS.NOT_FOUND);
  }

  return mapShortlink(shortlink);
}

export async function deleteShortlink(id: string): Promise<Shortlink> {
  const existing = await shortlinkRepository.findById(id);

  if (!existing) {
    throw new Error(SHORTLINK_ERRORS.NOT_FOUND);
  }

  const shortlink = await shortlinkRepository.delete(id);

  return mapShortlink(shortlink);
}
