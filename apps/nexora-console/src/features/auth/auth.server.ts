import "server-only";

import { adminSessionSchema, type AdminSession } from "@nexora/contracts/auth";

import { redirect } from "next/navigation";

import { cache } from "react";

import { ApiRequestError } from "@/lib/api/error";

import { serverApiRequest } from "@/lib/api/server";

const getAdminSessionCached = cache(async (): Promise<AdminSession | null> => {
  try {
    const data = await serverApiRequest<AdminSession>("/api/auth/context", {
      method: "GET",
      cache: "no-store",
    });

    return adminSessionSchema.parse(data);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return null;
    }

    throw error;
  }
});

export async function getAdminSession(): Promise<AdminSession | null> {
  return getAdminSessionCached();
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function redirectIfAuthenticated(): Promise<void> {
  const session = await getAdminSession();

  if (session) {
    redirect("/dashboard");
  }
}
