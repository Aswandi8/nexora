import { z } from "zod";
import { userSchema } from "../users";
import { permissionCodeSchema } from "../permissions";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authContextSchema = z.object({
  user: userSchema,
  permissions: z.array(permissionCodeSchema),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AuthContext = z.infer<typeof authContextSchema>;
