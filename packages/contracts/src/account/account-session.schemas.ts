import { z } from "zod";

export const accountSessionSchema = z
  .object({
    id: z.string(),
    current: z.boolean(),
    device: z.string(),
    browser: z.string(),
    operatingSystem: z.string(),
    ipAddress: z.string().nullable(),
    createdAt: z.string(),
    lastActiveAt: z.string(),
    expiresAt: z.string(),
  })
  .strict();

export const accountSessionListSchema = z
  .object({
    sessions: z.array(accountSessionSchema),
  })
  .strict();

export const revokeAccountSessionResultSchema = z
  .object({
    revoked: z.boolean(),
  })
  .strict();

export const logoutOtherSessionsResultSchema = z
  .object({
    revokedCount: z.number().int().nonnegative(),
  })
  .strict();

export const logoutAllSessionsResultSchema = z
  .object({
    revokedCount: z.number().int().nonnegative(),
  })
  .strict();

export type AccountSession = z.infer<typeof accountSessionSchema>;

export type AccountSessionList = z.infer<typeof accountSessionListSchema>;

export type RevokeAccountSessionResult = z.infer<
  typeof revokeAccountSessionResultSchema
>;

export type LogoutOtherSessionsResult = z.infer<
  typeof logoutOtherSessionsResultSchema
>;

export type LogoutAllSessionsResult = z.infer<
  typeof logoutAllSessionsResultSchema
>;
