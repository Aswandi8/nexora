import { z } from "zod";

import { USER_STATUSES } from "../common";
import { permissionCodeSchema } from "../permissions";
import { roleSchema } from "../roles";

export const userStatusSchema = z.enum(USER_STATUSES);

export const userRoleSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  isSystem: z.boolean(),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  status: userStatusSchema,
  role: roleSchema,
  permissions: z.array(permissionCodeSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: userStatusSchema,
  role: userRoleSummarySchema,
  isSuperAdmin: z.boolean(),
  createdAt: z.string(),
});

export const userStatusFilterSchema = z.enum(["all", ...USER_STATUSES]);

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(100).default(""),

  status: userStatusFilterSchema.default("all"),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(8).max(128),

  status: userStatusSchema.default("ACTIVE"),

  roleId: z.string().min(1, "Role is required."),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
    .optional(),

  status: userStatusSchema.optional(),

  roleId: z.string().min(1, "Role is required.").optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserListItem = z.infer<typeof userListItemSchema>;
export type UserRoleSummary = z.infer<typeof userRoleSummarySchema>;
export type UserStatusFilter = z.infer<typeof userStatusFilterSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
