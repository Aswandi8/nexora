import { z } from "zod";

const serverEnvSchema = z.object({
  NEXORA_CORE_URL: z
    .string()
    .trim()
    .url()
    .refine(
      (value) => {
        const protocol = new URL(value).protocol;

        return protocol === "http:" || protocol === "https:";
      },
      {
        message: "NEXORA_CORE_URL must use http or https",
      },
    )
    .transform((value) => value.replace(/\/+$/, "")),
});

const parsedEnv = serverEnvSchema.safeParse({
  NEXORA_CORE_URL: process.env.NEXORA_CORE_URL,
});

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "environment";

      return `${path}: ${issue.message}`;
    })
    .join("; ");

  throw new Error(`Invalid Nexora Console environment: ${message}`);
}

export const env = parsedEnv.data;
