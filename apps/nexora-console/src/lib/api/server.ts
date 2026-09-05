import "server-only";

import { headers } from "next/headers";

import { env } from "@/config/env";

import { createApiClient, type ApiRequestOptions } from "./client";

const serverApiClient = createApiClient({
  baseUrl: env.NEXORA_CORE_URL,
});

export interface ServerApiRequestOptions extends ApiRequestOptions {
  forwardCookies?: boolean;
}

export async function serverApiRequest<T>(
  path: string,
  options: ServerApiRequestOptions = {},
): Promise<T> {
  const {
    forwardCookies = true,
    headers: requestHeaders,
    ...requestOptions
  } = options;

  const outgoingHeaders = new Headers(requestHeaders);

  if (forwardCookies) {
    const incomingHeaders = await headers();

    const cookie = incomingHeaders.get("cookie");

    if (cookie) {
      outgoingHeaders.set("cookie", cookie);
    }
  }

  return serverApiClient.request<T>(path, {
    ...requestOptions,
    headers: outgoingHeaders,
  });
}
