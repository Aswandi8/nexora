import type { InspectedMedia } from "./media-inspector.types";

import { downloadRemoteMedia } from "./remote-media";

import { inspectImageFile } from "./image-inspector";

import { inspectVideoFile } from "./video-inspector";

function isImageMimeType(mimeType: string | null): boolean {
  return Boolean(mimeType?.startsWith("image/"));
}

function isVideoMimeType(mimeType: string | null): boolean {
  return Boolean(mimeType?.startsWith("video/"));
}

export async function inspectMediaUrl(
  mediaUrl: string,
): Promise<InspectedMedia> {
  const downloaded = await downloadRemoteMedia(mediaUrl);

  try {
    if (isImageMimeType(downloaded.contentType)) {
      return await inspectImageFile(
        downloaded.filePath,
        downloaded.contentType,
        downloaded.contentLength,
      );
    }

    if (isVideoMimeType(downloaded.contentType)) {
      return await inspectVideoFile(
        downloaded.filePath,
        downloaded.contentType,
        downloaded.contentLength,
      );
    }

    try {
      return await inspectImageFile(
        downloaded.filePath,
        downloaded.contentType,
        downloaded.contentLength,
      );
    } catch {
      try {
        return await inspectVideoFile(
          downloaded.filePath,
          downloaded.contentType,
          downloaded.contentLength,
        );
      } catch {
        throw new Error("UNSUPPORTED_MEDIA_TYPE");
      }
    }
  } finally {
    await downloaded.cleanup();
  }
}
