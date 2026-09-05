import { redirect } from "next/navigation";

import { getAdminSession } from "@/features/auth/auth.server";

export default async function HomePage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
