import { renderPublicShortlinkPlayerHtml } from "@/modules/shortlinks/public/public-shortlink-player-html";

import { createPublicStatusHtml } from "@/modules/shortlinks/public/public-shortlink-html.utils";

import { getPublicVideoShortlinkBySlug } from "@/modules/shortlinks/public/public-shortlink.service";

interface EmbedRouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, context: EmbedRouteContext) {
  const { slug } = await context.params;

  let shortlink;

  try {
    shortlink = await getPublicVideoShortlinkBySlug(slug);
  } catch (error) {
    console.error("Failed to load public video player", {
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
    return new Response(createPublicStatusHtml("Video not found"), {
      status: 404,

      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const html = renderPublicShortlinkPlayerHtml({
    shortlink,
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
