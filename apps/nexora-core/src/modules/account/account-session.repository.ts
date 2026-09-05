import { prisma } from "@/database";

export const accountSessionRepository = {
  listActive(userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  revokeOne(userId: string, currentSessionId: string, sessionId: string) {
    return prisma.session.deleteMany({
      where: {
        userId,
        AND: [
          {
            id: sessionId,
          },
          {
            id: {
              not: currentSessionId,
            },
          },
        ],
      },
    });
  },

  revokeOther(userId: string, currentSessionId: string) {
    return prisma.session.deleteMany({
      where: {
        userId,
        id: {
          not: currentSessionId,
        },
      },
    });
  },

  revokeAll(userId: string) {
    return prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  },
};
