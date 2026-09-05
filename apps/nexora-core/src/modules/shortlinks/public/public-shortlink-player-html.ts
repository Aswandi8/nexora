import type { PublicShortlinkPlayerRenderContext } from "./public-shortlink.types";

import {
  escapeAttribute,
  escapeHtml,
  normalizePublicHttpUrl,
} from "./public-shortlink-html.utils";

export function renderPublicShortlinkPlayerHtml({
  shortlink,
}: PublicShortlinkPlayerRenderContext): string {
  const mediaUrl = normalizePublicHttpUrl(shortlink.mediaUrl);

  const posterUrl = normalizePublicHttpUrl(shortlink.posterUrl);

  if (!mediaUrl) {
    throw new Error("INVALID_PUBLIC_SHORTLINK_MEDIA_URL");
  }

  const title = shortlink.title || shortlink.slug;

  const posterAttribute = posterUrl
    ? ` poster="${escapeAttribute(posterUrl)}"`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, viewport-fit=cover"
  >

  <meta
    name="robots"
    content="noindex, nofollow"
  >

  <title>${escapeHtml(title)}</title>

  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .player {
      display: block;
      width: 100%;
      height: 100%;
      background: #000;
      object-fit: contain;
    }
  </style>
</head>

<body>
  <video
    class="player"
    src="${escapeAttribute(mediaUrl)}"
    width="${shortlink.mediaWidth}"
    height="${shortlink.mediaHeight}"
    preload="metadata"
    controls
    playsinline${posterAttribute}
  ></video>
</body>
</html>`;
}
