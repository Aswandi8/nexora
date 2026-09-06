import { logger } from "@/lib/observability/logger";
import { renderPublicShortlinkHtml } from "@/modules/shortlinks/public/public-shortlink-html";
import { createPublicStatusHtml } from "@/modules/shortlinks/public/public-shortlink-html.utils";
import { getPublicShortlinkBySlug } from "@/modules/shortlinks/public/public-shortlink.service";

interface WatchRouteContext {
  params: Promise<{
    slug: string;
  }>;
}

function getConfiguredPublicOrigin(): string {
  const value =
    process.env.NEXORA_PUBLIC_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim();

  if (!value) {
    throw new Error("NEXORA_PUBLIC_URL is not configured");
  }

  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXORA_PUBLIC_URL must use http or https");
  }

  return url.origin;
}

function isXCardCrawler(request: Request): boolean {
  return /Twitterbot/i.test(request.headers.get("user-agent") ?? "");
}

export async function GET(request: Request, context: WatchRouteContext) {
  const { slug } = await context.params;

  let shortlink;

  try {
    shortlink = await getPublicShortlinkBySlug(slug);
  } catch (error) {
    logger.error("shortlink.public.lookup_failed", { slug, error });

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

  let publicOrigin: string;

  try {
    publicOrigin = getConfiguredPublicOrigin();
  } catch (error) {
    logger.error("shortlink.public.origin_invalid", { slug, error });

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
