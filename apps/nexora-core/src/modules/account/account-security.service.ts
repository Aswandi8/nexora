import {
  changeAccountPasswordSchema,
  type ChangeAccountPasswordResult,
} from "@nexora/contracts";

import { auth } from "@/auth/auth";
import { prisma } from "@/database";

interface CurrentSession {
  id: string;
  userId: string;
}

export async function changeOwnPassword(
  headers: Headers,
  currentSession: CurrentSession,
  input: unknown,
): Promise<ChangeAccountPasswordResult> {
  const data = changeAccountPasswordSchema.parse(input);

  await auth.api.changePassword({
    headers,
    body: {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: false,
    },
  });

  await prisma.session.deleteMany({
    where: {
      userId: currentSession.userId,
      id: {
        not: currentSession.id,
      },
    },
  });

  return {
    changed: true,
  };
}
