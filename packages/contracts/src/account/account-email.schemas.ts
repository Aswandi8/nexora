import { z } from "zod";

export const requestAccountEmailChangeSchema = z
  .object({
    newEmail: z.string().trim().email().max(254),
    currentPassword: z.string().min(1).max(128),
  })
  .strict();

export const accountEmailChangeSchema = z
  .object({
    pendingEmail: z.string().email(),
    expiresAt: z.string(),
  })
  .strict();

export const accountEmailSecuritySchema = z
  .object({
    email: z.string().email(),
    emailVerified: z.boolean(),
    pendingChange: accountEmailChangeSchema.nullable(),
  })
  .strict();

export const requestAccountEmailChangeResultSchema = z
  .object({
    pendingChange: accountEmailChangeSchema,
  })
  .strict();

export const resendAccountEmailChangeResultSchema = z
  .object({
    pendingChange: accountEmailChangeSchema,
  })
  .strict();

export const cancelAccountEmailChangeResultSchema = z
  .object({
    cancelled: z.boolean(),
  })
  .strict();

export const verifyAccountEmailChangeResultSchema = z
  .object({
    verified: z.boolean(),
    email: z.string().email(),
  })
  .strict();

export type RequestAccountEmailChangeInput = z.infer<
  typeof requestAccountEmailChangeSchema
>;

export type AccountEmailChange = z.infer<typeof accountEmailChangeSchema>;

export type AccountEmailSecurity = z.infer<typeof accountEmailSecuritySchema>;

export type RequestAccountEmailChangeResult = z.infer<
  typeof requestAccountEmailChangeResultSchema
>;

export type ResendAccountEmailChangeResult = z.infer<
  typeof resendAccountEmailChangeResultSchema
>;

export type CancelAccountEmailChangeResult = z.infer<
  typeof cancelAccountEmailChangeResultSchema
>;

export type VerifyAccountEmailChangeResult = z.infer<
  typeof verifyAccountEmailChangeResultSchema
>;
