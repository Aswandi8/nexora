import { prisma } from "@/database/prisma";

export async function findActivePublicShortlinkBySlug(slug: string) {
  return prisma.shortlink.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },

    select: {
      id: true,
      slug: true,
      destinationUrl: true,
      title: true,
      description: true,

      mediaType: true,
      mediaUrl: true,
      posterUrl: true,

      mediaWidth: true,
      mediaHeight: true,

      durationMs: true,
      displayDurationMs: true,

      mimeType: true,
      contentLength: true,

      updatedAt: true,
    },
  });
}
