import "server-only";

import {
  accountEmailSecuritySchema,
  type AccountEmailSecurity,
} from "@nexora/contracts";

import { serverApiRequest } from "@/lib/api/server";

export async function getEmailSecurity(): Promise<AccountEmailSecurity> {
  const result = await serverApiRequest<AccountEmailSecurity>(
    "/api/account/email",
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return accountEmailSecuritySchema.parse(result);
}
