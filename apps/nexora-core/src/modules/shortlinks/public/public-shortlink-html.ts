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

export function renderPublicShortlinkHtml({
  shortlink,
  canonicalUrl,
}: PublicShortlinkRenderContext): string {
  const title = shortlink.title || shortlink.slug;

  const description = shortlink.description ?? title;

  const destinationUrl = normalizePublicHttpUrl(shortlink.destinationUrl);

  const mediaUrl = normalizePublicHttpUrl(shortlink.mediaUrl);

  if (!destinationUrl) {
    throw new Error("INVALID_PUBLIC_SHORTLINK_DESTINATION");
  }

  if (!mediaUrl) {
    throw new Error("INVALID_PUBLIC_SHORTLINK_MEDIA_URL");
  }

  const socialImageUrl = getGeneratedPosterUrl(
    canonicalUrl,
    shortlink.updatedAt,
  );

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
    href="${escapeAttribute(destinationUrl)}"
  >

  ${metaProperty("og:type", "website")}

  ${metaProperty("og:url", destinationUrl)}

  ${metaProperty("og:title", title)}

  ${metaProperty("og:description", description)}

  ${metaProperty("og:image", socialImageUrl)}

  ${metaProperty("og:image:secure_url", socialImageUrl)}

  ${metaProperty("og:image:type", "image/jpeg")}

  ${metaProperty("og:image:width", "1200")}

  ${metaProperty("og:image:height", "675")}

  ${metaProperty("og:image:alt", title)}

  ${metaName("twitter:card", "summary_large_image")}

  ${metaName("twitter:title", title)}

  ${metaName("twitter:description", description)}

  ${metaName("twitter:image", socialImageUrl)}

  ${metaName("twitter:image:alt", title)}
</head>

<body>
  <a href="${escapeAttribute(destinationUrl)}">
    ${escapeHtml(title)}
  </a>
</body>
</html>`;
}
