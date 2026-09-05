import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/database/prisma";
import { sendInvitationEmail } from "@/lib/email/invitation-email";

function requireHttpUrl(name: string, value: string | undefined): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${name} is not configured`);
  }

  let url: URL;

  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must use http or https`);
  }

  return normalized.replace(/\/+$/, "");
}

const baseURL = requireHttpUrl("BETTER_AUTH_URL", process.env.BETTER_AUTH_URL);

const consoleURL = requireHttpUrl(
  "NEXORA_CONSOLE_URL",
  process.env.NEXORA_CONSOLE_URL,
);

const secret = process.env.BETTER_AUTH_SECRET?.trim();

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is not configured");
}

export const auth = betterAuth({
  baseURL,
  secret,
  trustedOrigins: [new URL(consoleURL).origin],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,

    minPasswordLength: 8,
    maxPasswordLength: 128,

    sendResetPassword: async ({ user, url }) => {
      await sendInvitationEmail({
        to: user.email,
        name: user.name,
        url,
      });
    },

    onPasswordReset: async ({ user }) => {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: true,
        },
      });
    },

    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,

    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },

      "/sign-up/email": {
        window: 60,
        max: 3,
      },

      "/request-password-reset": {
        window: 60,
        max: 3,
      },

      "/change-password": {
        window: 60,
        max: 5,
      },
    },
  },

  advanced: {
    database: {
      joins: true,
    },
  },
});
