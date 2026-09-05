import { renderPublicShortlinkHtml } from "@/modules/shortlinks/public/public-shortlink-html";

import { createPublicStatusHtml } from "@/modules/shortlinks/public/public-shortlink-html.utils";

import { getPublicShortlinkBySlug } from "@/modules/shortlinks/public/public-shortlink.service";

interface WatchRouteContext {
  params: Promise<{
    slug: string;
  }>;
}

function getFirstForwardedValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const firstValue = value.split(",")[0]?.trim();

  return firstValue || null;
}

function getPublicOrigin(request: Request): string {
  const requestUrl = new URL(request.url);

  const forwardedProto = getFirstForwardedValue(
    request.headers.get("x-forwarded-proto"),
  );

  const forwardedHost = getFirstForwardedValue(
    request.headers.get("x-forwarded-host"),
  );

  const host = getFirstForwardedValue(request.headers.get("host"));

  const protocol =
    forwardedProto === "https" || forwardedProto === "http"
      ? forwardedProto
      : requestUrl.protocol.replace(":", "");

  const publicHost = forwardedHost ?? host ?? requestUrl.host;

  try {
    const origin = new URL(`${protocol}://${publicHost}`);

    if (origin.protocol !== "http:" && origin.protocol !== "https:") {
      return requestUrl.origin;
    }

    return origin.origin;
  } catch {
    return requestUrl.origin;
  }
}

function isXCardCrawler(request: Request): boolean {
  const userAgent = request.headers.get("user-agent") ?? "";

  return /Twitterbot/i.test(userAgent);
}

export async function GET(request: Request, context: WatchRouteContext) {
  const { slug } = await context.params;

  let shortlink;

  try {
    shortlink = await getPublicShortlinkBySlug(slug);
  } catch (error) {
    console.error("Failed to load public shortlink", {
      slug,
      error,
    });

    return new Response(createPublicStatusHtml("Service unavailable"), {
      status: 503,

      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "30",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (!shortlink) {
    return new Response(createPublicStatusHtml("Shortlink not found"), {
      status: 404,

      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (!isXCardCrawler(request)) {
    return Response.redirect(shortlink.destinationUrl, 302);
  }

  const publicOrigin = getPublicOrigin(request);

  const canonicalUrl = new URL(
    `/watch/${encodeURIComponent(shortlink.slug)}`,
    publicOrigin,
  ).toString();

  const html = renderPublicShortlinkHtml({
    shortlink,
    canonicalUrl,
  });

  return new Response(html, {
    status: 200,

    headers: {
      "Content-Type": "text/html; charset=utf-8",

      "Cache-Control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=600",

      "X-Content-Type-Options": "nosniff",

      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}
