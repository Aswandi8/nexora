import type { PublicShortlinkRenderContext } from "./public-shortlink.types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function normalizePublicHttpUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function metaProperty(property: string, content: string | null): string {
  if (!content) {
    return "";
  }

  return `<meta property="${escapeAttribute(property)}" content="${escapeAttribute(content)}">`;
}

function metaName(name: string, content: string | null): string {
  if (!content) {
    return "";
  }

  return `<meta name="${escapeAttribute(name)}" content="${escapeAttribute(content)}">`;
}

function getGeneratedPosterUrl(
  canonicalUrl: string,
  updatedAt: string,
): string {
  const url = new URL(`${canonicalUrl}/poster`);

  url.searchParams.set("v", updatedAt);

  return url.toString();
}

function getVideoPosterUrl(
  posterUrl: string | null,
  canonicalUrl: string,
  updatedAt: string,
): string {
  return posterUrl ?? getGeneratedPosterUrl(canonicalUrl, updatedAt);
}

function formatDisplayDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderPlayButton(): string {
  return `
    <div class="play-button" aria-hidden="true">
      <span></span>
    </div>
  `;
}

function renderDisplayDuration(displayDurationMs: number): string {
  return `
    <div class="duration">
      ${escapeHtml(formatDisplayDuration(displayDurationMs))}
    </div>
  `;
}

function renderImageMedia(
  mediaUrl: string,
  destinationUrl: string,
  title: string,
  width: number,
  height: number,
  displayDurationMs: number,
): string {
  return `
    <a
      class="media-link"
      href="${escapeAttribute(destinationUrl)}"
      rel="noopener noreferrer"
      aria-label="${escapeAttribute(title)}"
    >
      <div class="media-frame">
        <img
          class="media"
          src="${escapeAttribute(mediaUrl)}"
          alt="${escapeAttribute(title)}"
          width="${width}"
          height="${height}"
        >

        ${renderPlayButton()}

        ${renderDisplayDuration(displayDurationMs)}
      </div>
    </a>
  `;
}

function renderVideoMedia(
  mediaUrl: string,
  posterUrl: string,
  destinationUrl: string,
  title: string,
  width: number,
  height: number,
  displayDurationMs: number,
): string {
  return `
    <a
      class="media-link"
      href="${escapeAttribute(destinationUrl)}"
      rel="noopener noreferrer"
      aria-label="${escapeAttribute(title)}"
    >
      <div class="media-frame">
        <video
          class="media"
          src="${escapeAttribute(mediaUrl)}"
          poster="${escapeAttribute(posterUrl)}"
          width="${width}"
          height="${height}"
          preload="metadata"
          muted
          playsinline
        ></video>

        ${renderPlayButton()}

        ${renderDisplayDuration(displayDurationMs)}
      </div>
    </a>
  `;
}

export function renderPublicShortlinkHtml({
  shortlink,
  canonicalUrl,
}: PublicShortlinkRenderContext): string {
  const title = shortlink.title || shortlink.slug;

  const description = shortlink.description ?? title;

  const destinationUrl = normalizePublicHttpUrl(shortlink.destinationUrl);

  const mediaUrl = normalizePublicHttpUrl(shortlink.mediaUrl);

  const storedPosterUrl = normalizePublicHttpUrl(shortlink.posterUrl);

  if (!destinationUrl) {
    throw new Error("INVALID_PUBLIC_SHORTLINK_DESTINATION");
  }

  if (!mediaUrl) {
    throw new Error("INVALID_PUBLIC_SHORTLINK_MEDIA_URL");
  }

  const videoPosterUrl =
    shortlink.mediaType === "VIDEO"
      ? getVideoPosterUrl(storedPosterUrl, canonicalUrl, shortlink.updatedAt)
      : null;

  const socialImageUrl =
    shortlink.mediaType === "IMAGE" ? mediaUrl : videoPosterUrl;

  const mediaMarkup =
    shortlink.mediaType === "IMAGE"
      ? renderImageMedia(
          mediaUrl,
          destinationUrl,
          title,
          shortlink.mediaWidth,
          shortlink.mediaHeight,
          shortlink.displayDurationMs,
        )
      : renderVideoMedia(
          mediaUrl,
          videoPosterUrl!,
          destinationUrl,
          title,
          shortlink.mediaWidth,
          shortlink.mediaHeight,
          shortlink.displayDurationMs,
        );

  const openGraphMedia =
    shortlink.mediaType === "IMAGE"
      ? [
          metaProperty("og:image", mediaUrl),

          metaProperty("og:image:secure_url", mediaUrl),

          metaProperty("og:image:type", shortlink.mimeType),

          metaProperty("og:image:width", String(shortlink.mediaWidth)),

          metaProperty("og:image:height", String(shortlink.mediaHeight)),

          metaProperty("og:image:alt", title),
        ].join("\n")
      : [
          metaProperty("og:image", videoPosterUrl),

          metaProperty("og:image:secure_url", videoPosterUrl),

          metaProperty("og:image:width", String(shortlink.mediaWidth)),

          metaProperty("og:image:height", String(shortlink.mediaHeight)),

          metaProperty("og:image:alt", title),

          metaProperty("og:video", mediaUrl),

          metaProperty("og:video:secure_url", mediaUrl),

          metaProperty("og:video:type", shortlink.mimeType),

          metaProperty("og:video:width", String(shortlink.mediaWidth)),

          metaProperty("og:video:height", String(shortlink.mediaHeight)),
        ].join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, viewport-fit=cover"
  >

  <title>${escapeHtml(title)}</title>

  ${metaName("description", description)}

  <link
    rel="canonical"
    href="${escapeAttribute(canonicalUrl)}"
  >

  ${metaProperty(
    "og:type",
    shortlink.mediaType === "VIDEO" ? "video.other" : "website",
  )}

  ${metaProperty("og:url", canonicalUrl)}

  ${metaProperty("og:title", title)}

  ${metaProperty("og:description", description)}

  ${openGraphMedia}

  ${metaName("twitter:card", "summary_large_image")}

  ${metaName("twitter:title", title)}

  ${metaName("twitter:description", description)}

  ${metaName("twitter:image", socialImageUrl)}

  ${metaName("twitter:image:alt", socialImageUrl ? title : null)}

  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      background: #000;
    }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, Helvetica, sans-serif;
    }

    .page {
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .media-link {
      display: block;
      width: min(
        100%,
        ${shortlink.mediaWidth}px
      );
      text-decoration: none;
      cursor: pointer;
    }

    .media-frame {
      position: relative;
      width: 100%;
    }

    .media {
      display: block;
      width: 100%;
      height: auto;
      max-height: 100vh;
      object-fit: contain;
      background: #000;
    }

    .play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background: rgba(0, 0, 0, 0.7);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    .play-button span {
      display: block;
      width: 0;
      height: 0;
      margin-left: 6px;
      border-top: 13px solid transparent;
      border-bottom: 13px solid transparent;
      border-left: 21px solid #fff;
    }

    .duration {
      position: absolute;
      right: 12px;
      bottom: 12px;
      padding: 5px 8px;
      border-radius: 6px;
      color: #fff;
      background: rgba(0, 0, 0, 0.78);
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      pointer-events: none;
    }
  </style>
</head>

<body>
  <main class="page">
    ${mediaMarkup}
  </main>
</body>
</html>`;
}
