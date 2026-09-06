import sharp from "sharp";

import { downloadRemoteMedia } from "@/integrations/media/remote-media";
import { logger } from "@/lib/observability/logger";
import { getPublicShortlinkBySlug } from "@/modules/shortlinks/public/public-shortlink.service";

interface PosterRouteContext {
  params: Promise<{
    slug: string;
  }>;
}

const POSTER_WIDTH = 1200;
const POSTER_HEIGHT = 675;
const POSTER_MAX_BYTES = 25 * 1024 * 1024;
const POSTER_MAX_INPUT_PIXELS = 40_000_000;
const POSTER_TIMEOUT_MS = 15_000;
const POSTER_MAX_CONCURRENT_GENERATIONS = 2;

let activePosterGenerations = 0;

function createOverlaySvg(): Buffer {
  return Buffer.from(`
    <svg width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="600" cy="337.5" r="60" fill="rgba(0,0,0,0.72)" />
      <path d="M586 309 L586 366 L633 337.5 Z" fill="#ffffff" />
    </svg>
  `);
}

function createPosterEtag(slug: string, updatedAt: string): string {
  const version = Buffer.from(`${slug}:${updatedAt}`).toString("base64url");
  return `W/"poster-${version}"`;
}

function createCanonicalPosterUrl(request: Request, updatedAt: string): string {
  const url = new URL(request.url);
  url.search = "";
  url.searchParams.set("v", updatedAt);
  return url.toString();
}

function isCanonicalVersionRequest(
  request: Request,
  updatedAt: string,
): boolean {
  const url = new URL(request.url);
  const keys = [...url.searchParams.keys()];
  return (
    keys.length === 1 &&
    keys[0] === "v" &&
    url.searchParams.get("v") === updatedAt
  );
}

export async function GET(request: Request, context: PosterRouteContext) {
  const { slug } = await context.params;

  let shortlink;

  try {
    shortlink = await getPublicShortlinkBySlug(slug);
  } catch (error) {
    logger.error("shortlink.poster.lookup_failed", { slug, error });
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "30" },
    });
  }

  if (!shortlink || shortlink.mediaType !== "IMAGE") {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }

  if (!isCanonicalVersionRequest(request, shortlink.updatedAt)) {
    return Response.redirect(
      createCanonicalPosterUrl(request, shortlink.updatedAt),
      307,
    );
  }

  const etag = createPosterEtag(shortlink.slug, shortlink.updatedAt);

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  }

  if (activePosterGenerations >= POSTER_MAX_CONCURRENT_GENERATIONS) {
    logger.warn("shortlink.poster.busy", { slug, activePosterGenerations });
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "2" },
    });
  }

  activePosterGenerations += 1;

  let downloadedMedia: Awaited<ReturnType<typeof downloadRemoteMedia>> | null =
    null;

  try {
    downloadedMedia = await downloadRemoteMedia(shortlink.mediaUrl, {
      maxBytes: POSTER_MAX_BYTES,
      timeoutMs: POSTER_TIMEOUT_MS,
      maxRedirects: 5,
      accept: "image/*",
      userAgent: "Nexora-Social-Poster/1.0",
    });

    const poster = await sharp(downloadedMedia.filePath, {
      failOn: "error",
      limitInputPixels: POSTER_MAX_INPUT_PIXELS,
    })
      .rotate()
      .resize(POSTER_WIDTH, POSTER_HEIGHT, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      })
      .composite([{ input: createOverlaySvg(), top: 0, left: 0 }])
      .jpeg({
        quality: 88,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    return new Response(new Uint8Array(poster), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(poster.byteLength),
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        ETag: etag,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logger.error("shortlink.poster.generation_failed", { slug, error });
    return new Response(null, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  } finally {
    activePosterGenerations = Math.max(0, activePosterGenerations - 1);

    if (downloadedMedia) {
      await downloadedMedia.cleanup();
    }
  }
}
