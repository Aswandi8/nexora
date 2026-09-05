import { env } from "@/config/env";

const AUTH_PROXY_TIMEOUT_MS = 15_000;

function createCoreAuthUrl(request: Request, path: string[]): URL {
  const requestUrl = new URL(request.url);

  const coreUrl = new URL(`/api/auth/${path.join("/")}`, env.NEXORA_CORE_URL);

  coreUrl.search = requestUrl.search;

  return coreUrl;
}

function normalizeSetCookie(setCookie: string): string {
  return setCookie
    .replace(/;\s*Domain=[^;]+/gi, "")
    .replace(/;\s*Path=[^;]+/gi, "")
    .concat("; Path=/");
}

function copyResponseHeaders(source: Headers, target: Headers): void {
  source.forEach((value, key) => {
    if (
      key.toLowerCase() === "set-cookie" ||
      key.toLowerCase() === "content-length"
    ) {
      return;
    }

    target.set(key, value);
  });

  const headersWithSetCookie = source as Headers & {
    getSetCookie?: () => string[];
  };

  const setCookies =
    typeof headersWithSetCookie.getSetCookie === "function"
      ? headersWithSetCookie.getSetCookie()
      : [];

  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      target.append("set-cookie", normalizeSetCookie(cookie));
    }

    return;
  }

  const setCookie = source.get("set-cookie");

  if (setCookie) {
    target.append("set-cookie", normalizeSetCookie(setCookie));
  }
}

async function proxyAuthRequest(
  request: Request,
  path: string[],
): Promise<Response> {
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");

  const method = request.method;

  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  try {
    const response = await fetch(createCoreAuthUrl(request, path), {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(AUTH_PROXY_TIMEOUT_MS),
    });

    const responseHeaders = new Headers();

    copyResponseHeaders(response.headers, responseHeaders);

    responseHeaders.set("cache-control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      {
        message: "Layanan autentikasi sedang tidak tersedia.",
      },
      {
        status: 503,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}

interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;

  return proxyAuthRequest(request, path);
}

export async function POST(request: Request, context: RouteContext) {
  const { path } = await context.params;

  return proxyAuthRequest(request, path);
}
