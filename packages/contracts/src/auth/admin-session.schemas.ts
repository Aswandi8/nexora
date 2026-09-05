import { z } from "zod";

import { permissionCodeSchema } from "../permissions";

export const adminSessionRoleSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    isSystem: z.boolean(),
  })
  .strict();

export const adminSessionUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    status: z.literal("ACTIVE"),
    role: adminSessionRoleSchema.nullable(),
  })
  .strict();

export const adminSessionSchema = z
  .object({
    user: adminSessionUserSchema,
    permissions: z.array(permissionCodeSchema),
  })
  .strict();

export type AdminSessionRole = z.infer<typeof adminSessionRoleSchema>;
export type AdminSessionUser = z.infer<typeof adminSessionUserSchema>;
export type AdminSession = z.infer<typeof adminSessionSchema>;
