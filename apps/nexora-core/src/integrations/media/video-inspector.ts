import { spawn } from "node:child_process";

import ffprobeStatic from "ffprobe-static";

import type { InspectedMedia } from "./media-inspector.types";

type FfprobeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
  duration?: string;
  tags?: {
    rotate?: string;
  };
  side_data_list?: Array<{
    rotation?: number;
  }>;
};

type FfprobeFormat = {
  duration?: string;
  format_name?: string;
};

type FfprobeResult = {
  streams?: FfprobeStream[];
  format?: FfprobeFormat;
};

const ffprobePath = ffprobeStatic.path;

if (!ffprobePath) {
  throw new Error("FFPROBE_BINARY_NOT_FOUND");
}

function runFfprobe(filePath: string): Promise<FfprobeResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      ffprobePath,
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", filePath],
      {
        windowsHide: true,
      },
    );

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill();

      reject(new Error("FFPROBE_TIMEOUT"));
    }, 20_000);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        reject(new Error(`FFPROBE_FAILED: ${stderr}`));

        return;
      }

      try {
        const parsed = JSON.parse(stdout) as FfprobeResult;

        resolve(parsed);
      } catch {
        reject(new Error("FFPROBE_INVALID_OUTPUT"));
      }
    });
  });
}

function getRotation(stream: FfprobeStream): number {
  const sideDataRotation = stream.side_data_list?.find(
    (item) => typeof item.rotation === "number",
  )?.rotation;

  if (typeof sideDataRotation === "number") {
    return sideDataRotation;
  }

  const tagRotation = stream.tags?.rotate;

  if (tagRotation) {
    const parsed = Number.parseInt(tagRotation, 10);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function normalizeDimensions(
  width: number,
  height: number,
  rotation: number,
): {
  width: number;
  height: number;
} {
  const normalizedRotation = Math.abs(rotation) % 360;

  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return {
      width: height,
      height: width,
    };
  }

  return {
    width,
    height,
  };
}

function getDurationMs(
  stream: FfprobeStream,
  format?: FfprobeFormat,
): number | null {
  const durationValue = stream.duration ?? format?.duration;

  if (!durationValue) {
    return null;
  }

  const seconds = Number.parseFloat(durationValue);

  if (!Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return Math.round(seconds * 1000);
}

function inferVideoMimeType(
  contentType: string | null,
  formatName?: string,
): string | null {
  if (contentType?.startsWith("video/")) {
    return contentType.split(";")[0].trim();
  }

  if (!formatName) {
    return contentType;
  }

  const formats = formatName
    .toLowerCase()
    .split(",")
    .map((format) => format.trim());

  if (
    formats.includes("mp4") ||
    formats.includes("mov") ||
    formats.includes("m4a") ||
    formats.includes("3gp") ||
    formats.includes("3g2") ||
    formats.includes("mj2")
  ) {
    return "video/mp4";
  }

  if (formats.includes("webm")) {
    return "video/webm";
  }

  if (formats.includes("matroska")) {
    return "video/x-matroska";
  }

  if (formats.includes("mpegts")) {
    return "video/mp2t";
  }

  if (formats.includes("avi")) {
    return "video/x-msvideo";
  }

  return contentType;
}

export async function inspectVideoFile(
  filePath: string,
  contentType: string | null,
  contentLength: number,
): Promise<InspectedMedia> {
  const result = await runFfprobe(filePath);

  const videoStream = result.streams?.find(
    (stream) => stream.codec_type === "video",
  );

  if (!videoStream || !videoStream.width || !videoStream.height) {
    throw new Error("VIDEO_STREAM_NOT_FOUND");
  }

  const rotation = getRotation(videoStream);

  const dimensions = normalizeDimensions(
    videoStream.width,
    videoStream.height,
    rotation,
  );

  return {
    mediaType: "VIDEO",
    mediaWidth: dimensions.width,
    mediaHeight: dimensions.height,
    durationMs: getDurationMs(videoStream, result.format),
    mimeType: inferVideoMimeType(contentType, result.format?.format_name),
    contentLength,
  };
}
