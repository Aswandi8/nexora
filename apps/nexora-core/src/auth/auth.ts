import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/database/prisma";

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
  },

  /*
   * Better Auth already owns the authentication boundary,
   * therefore rate limiting remains here instead of
   * introducing another competing limiter around auth.
   *
   * Server-side calls through auth.api are not rate limited.
   */
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
    },
  },

  advanced: {
    database: {
      joins: true,
    },
  },
});
