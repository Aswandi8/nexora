import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { UnauthorizedPage } from "@/components/feedback/unauthorized-page";

import { getAdminSession } from "@/features/auth/auth.server";

export const metadata: Metadata = {
  title: "Authentication required",
};

export default async function UnauthorizedRoute() {
  const session = await getAdminSession();

  if (session) {
    redirect("/dashboard");
  }

  return <UnauthorizedPage />;
}
