import type { Metadata } from "next";

import { ForbiddenPage } from "@/components/feedback/forbidden-page";

import { requireAdminSession } from "@/features/auth/auth.server";

export const metadata: Metadata = {
  title: "Access denied",
};

export default async function ForbiddenRoute() {
  await requireAdminSession();

  return <ForbiddenPage />;
}
