import { z } from "zod";

import { permissionCodeSchema } from "../permissions";

export const adminSessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: z.literal("ACTIVE"),
});

export const adminSessionSchema = z.object({
  user: adminSessionUserSchema,
  permissions: z.array(permissionCodeSchema),
});

export type AdminSessionUser = z.infer<typeof adminSessionUserSchema>;

export type AdminSession = z.infer<typeof adminSessionSchema>;
