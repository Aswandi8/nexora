import { z } from "zod";

export const updateAccountProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must not exceed 100 characters."),
  })
  .strict();

export const updateAccountProfileResultSchema = z
  .object({
    name: z.string(),
  })
  .strict();

export type UpdateAccountProfileInput = z.infer<
  typeof updateAccountProfileSchema
>;
export type UpdateAccountProfileResult = z.infer<
  typeof updateAccountProfileResultSchema
>;
