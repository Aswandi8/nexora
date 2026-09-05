import { z } from "zod";

export const changeAccountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must not exceed 128 characters."),
    confirmPassword: z.string().min(1, "Password confirmation is required."),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password confirmation does not match.",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current password.",
  });

export const changeAccountPasswordResultSchema = z
  .object({
    changed: z.literal(true),
  })
  .strict();

export type ChangeAccountPasswordInput = z.infer<
  typeof changeAccountPasswordSchema
>;

export type ChangeAccountPasswordResult = z.infer<
  typeof changeAccountPasswordResultSchema
>;
