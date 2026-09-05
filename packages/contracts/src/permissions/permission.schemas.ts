import { z } from "zod";

import { PERMISSIONS, type PermissionCode } from "./permission.constants";

export const permissionCodeSchema = z.custom<PermissionCode>(
  (value) =>
    typeof value === "string" &&
    Object.values(PERMISSIONS).includes(value as PermissionCode),
  {
    message: "Invalid permission code",
  },
);

export const permissionSchema = z.object({
  id: z.string(),
  code: permissionCodeSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(255).nullable(),
});

export const permissionResourceFilterSchema = z
  .string()
  .trim()
  .max(100)
  .default("all");

export const permissionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(100).default(""),

  resource: permissionResourceFilterSchema,
});

export type Permission = z.infer<typeof permissionSchema>;

export type PermissionResourceFilter = z.infer<
  typeof permissionResourceFilterSchema
>;

export type PermissionListQuery = z.infer<typeof permissionListQuerySchema>;
