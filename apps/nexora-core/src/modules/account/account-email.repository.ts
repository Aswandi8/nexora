import { prisma } from "@/database";

export const accountEmailRepository = {
  findSecurityState(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        emailChange: {
          select: {
            newEmail: true,
            expiresAt: true,
          },
        },
      },
    });
  },

  findEmailOwner(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
  },

  findPendingByUserId(userId: string) {
    return prisma.accountEmailChange.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        newEmail: true,
        expiresAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  },

  findPendingByTokenHash(tokenHash: string) {
    return prisma.accountEmailChange.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        userId: true,
        newEmail: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  upsertPending(input: {
    userId: string;
    newEmail: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.accountEmailChange.upsert({
      where: {
        userId: input.userId,
      },
      create: {
        userId: input.userId,
        newEmail: input.newEmail,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
      update: {
        newEmail: input.newEmail,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
      select: {
        newEmail: true,
        expiresAt: true,
      },
    });
  },

  updateToken(id: string, tokenHash: string, expiresAt: Date) {
    return prisma.accountEmailChange.update({
      where: {
        id,
      },
      data: {
        tokenHash,
        expiresAt,
      },
      select: {
        newEmail: true,
        expiresAt: true,
      },
    });
  },

  cancel(userId: string) {
    return prisma.accountEmailChange.deleteMany({
      where: {
        userId,
      },
    });
  },

  async verify(pendingId: string, userId: string, newEmail: string) {
    return prisma.$transaction(async (tx) => {
      const conflict = await tx.user.findUnique({
        where: {
          email: newEmail,
        },
        select: {
          id: true,
        },
      });

      if (conflict && conflict.id !== userId) {
        throw new Error("EMAIL_UNAVAILABLE");
      }

      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          email: newEmail,
          emailVerified: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      await tx.accountEmailChange.delete({
        where: {
          id: pendingId,
        },
      });

      await tx.session.deleteMany({
        where: {
          userId,
        },
      });

      return user;
    });
  },
};
