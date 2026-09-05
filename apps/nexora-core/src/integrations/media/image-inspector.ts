import sharp from "sharp";

import type { InspectedMedia } from "./media-inspector.types";

const SWAPPED_ORIENTATIONS = new Set([5, 6, 7, 8]);

function resolveImageMimeType(
  format: string | undefined,
  providedMimeType: string | null,
): string | null {
  if (providedMimeType?.startsWith("image/")) {
    return providedMimeType;
  }

  switch (format) {
    case "jpeg":
    case "jpg":
      return "image/jpeg";

    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "gif":
      return "image/gif";

    case "avif":
      return "image/avif";

    case "heif":
      return "image/heif";

    case "tiff":
      return "image/tiff";

    case "svg":
      return "image/svg+xml";

    default:
      return null;
  }
}

export async function inspectImageFile(
  filePath: string,
  providedMimeType: string | null,
  contentLength: number | null,
): Promise<InspectedMedia> {
  const metadata = await sharp(filePath, {
    failOn: "error",
    limitInputPixels: false,
  }).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("IMAGE_DIMENSIONS_NOT_FOUND");
  }

  let width = metadata.width;
  let height = metadata.height;

  if (metadata.orientation && SWAPPED_ORIENTATIONS.has(metadata.orientation)) {
    [width, height] = [height, width];
  }

  return {
    mediaType: "IMAGE",
    mediaWidth: width,
    mediaHeight: height,
    durationMs: null,
    mimeType: resolveImageMimeType(metadata.format, providedMimeType),
    contentLength,
  };
}
