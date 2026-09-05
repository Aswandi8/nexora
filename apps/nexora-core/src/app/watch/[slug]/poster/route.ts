import sharp from "sharp";

import { downloadRemoteMedia } from "@/integrations/media/remote-media";

import { getPublicShortlinkBySlug } from "@/modules/shortlinks/public/public-shortlink.service";

interface PosterRouteContext {
  params: Promise<{
    slug: string;
  }>;
}

const POSTER_WIDTH = 1200;
const POSTER_HEIGHT = 675;
const POSTER_MAX_BYTES = 25 * 1024 * 1024;
const POSTER_TIMEOUT_MS = 15_000;

function formatDisplayDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function escapeSvg(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createOverlaySvg(displayDurationMs: number): Buffer {
  const duration = escapeSvg(formatDisplayDuration(displayDurationMs));

  return Buffer.from(`
    <svg
      width="${POSTER_WIDTH}"
      height="${POSTER_HEIGHT}"
      viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="600"
        cy="337.5"
        r="60"
        fill="rgba(0,0,0,0.72)"
      />

      <path
        d="M580 300 L580 375 L645 337.5 Z"
        fill="#ffffff"
      />

      <rect
        x="1040"
        y="593"
        width="120"
        height="50"
        rx="9"
        fill="rgba(0,0,0,0.78)"
      />

      <text
        x="1100"
        y="626"
        fill="#ffffff"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="700"
        text-anchor="middle"
      >
        ${duration}
      </text>
    </svg>
  `);
}

export async function GET(_request: Request, context: PosterRouteContext) {
  const { slug } = await context.params;

  let shortlink;

  try {
    shortlink = await getPublicShortlinkBySlug(slug);
  } catch (error) {
    console.error("Failed to load shortlink poster", {
      slug,
      error,
    });

    return new Response(null, {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  if (!shortlink || shortlink.mediaType !== "IMAGE") {
    return new Response(null, {
      status: 404,
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    });
  }

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

    const overlay = createOverlaySvg(shortlink.displayDurationMs);

    const poster = await sharp(downloadedMedia.filePath, {
      failOn: "error",
      limitInputPixels: false,
    })
      .rotate()
      .resize(POSTER_WIDTH, POSTER_HEIGHT, {
        fit: "cover",
        position: "centre",
      })
      .composite([
        {
          input: overlay,
          top: 0,
          left: 0,
        },
      ])
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toBuffer();

    return new Response(new Uint8Array(poster), {
      status: 200,

      headers: {
        "Content-Type": "image/jpeg",

        "Content-Length": String(poster.byteLength),

        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",

        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Failed to generate shortlink poster", {
      slug,
      error,
    });

    return new Response(null, {
      status: 502,

      headers: {
        "Cache-Control": "no-store",
      },
    });
  } finally {
    if (downloadedMedia) {
      await downloadedMedia.cleanup();
    }
  }
}
