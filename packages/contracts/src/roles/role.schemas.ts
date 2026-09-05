import { z } from "zod";

import { permissionCodeSchema } from "../permissions";

import { SYSTEM_ROLES } from "./role.constants";

export const systemRoleSchema = z.enum(SYSTEM_ROLES);

export const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(100),
  description: z.string().max(255).nullable(),
  isSystem: z.boolean(),
  permissions: z.array(permissionCodeSchema),
});

export const roleListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  userCount: z.number().int().nonnegative(),
  permissionCount: z.number().int().nonnegative(),
});

export const roleTypeFilterSchema = z.enum(["all", "system", "custom"]);

export const roleListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(100).default(""),

  type: roleTypeFilterSchema.default("all"),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(100),

  code: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Code must use uppercase letters, numbers, and underscores.",
    ),

  description: z.string().trim().max(255).nullable().optional(),

  permissions: z.array(permissionCodeSchema).default([]),
});

export const updateRoleSchema = createRoleSchema.partial();

export type Role = z.infer<typeof roleSchema>;

export type RoleListItem = z.infer<typeof roleListItemSchema>;

export type RoleTypeFilter = z.infer<typeof roleTypeFilterSchema>;

export type RoleListQuery = z.infer<typeof roleListQuerySchema>;

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
