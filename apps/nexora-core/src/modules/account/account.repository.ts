import { prisma } from "@/database";

export const accountRepository = {
  updateName(userId: string, name: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
      },
      select: {
        name: true,
      },
    });
  },
};
