import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest, type RequestOptions } from "node:https";
import { mkdtemp, open, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  DownloadedRemoteMedia,
  RemoteMediaDownloadOptions,
  SafeRemoteMediaTarget,
} from "./media-inspector.types";
import { assertSafeRemoteMediaUrl } from "./media-url-security";

const DEFAULT_MAX_BYTES = 250 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_ACCEPT =
  "image/*,video/*,application/octet-stream;q=0.8,*/*;q=0.5";
const DEFAULT_USER_AGENT = "Nexora-Media-Inspector/1.0";

type ResolvedRemoteMediaDownloadOptions = {
  maxBytes: number;
  timeoutMs: number;
  maxRedirects: number;
  accept: string;
  userAgent: string;
};

type SafeRemoteResponse = {
  response: IncomingMessage;
  finalUrl: string;
};

function getConfiguredMaxMediaBytes(): number {
  const configured = Number(process.env.SHORTLINK_MEDIA_MAX_BYTES);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }
  return DEFAULT_MAX_BYTES;
}

function getConfiguredRequestTimeoutMs(): number {
  const configured = Number(process.env.SHORTLINK_MEDIA_TIMEOUT_MS);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  return DEFAULT_TIMEOUT_MS;
}

function normalizePositiveNumber(
  value: number | undefined,
  fallback: number,
): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  return fallback;
}

function normalizeRedirectCount(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return DEFAULT_MAX_REDIRECTS;
  }

  return Math.floor(value);
}

function resolveDownloadOptions(
  options: RemoteMediaDownloadOptions,
): ResolvedRemoteMediaDownloadOptions {
  return {
    maxBytes: normalizePositiveNumber(
      options.maxBytes,
      getConfiguredMaxMediaBytes(),
    ),

    timeoutMs: normalizePositiveNumber(
      options.timeoutMs,
      getConfiguredRequestTimeoutMs(),
    ),

    maxRedirects: normalizeRedirectCount(options.maxRedirects),

    accept: options.accept?.trim() || DEFAULT_ACCEPT,

    userAgent: options.userAgent?.trim() || DEFAULT_USER_AGENT,
  };
}

function normalizeContentType(
  value: string | string[] | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const contentType = Array.isArray(value) ? value[0] : value;

  if (!contentType) {
    return null;
  }

  return contentType.split(";")[0]?.trim().toLowerCase() || null;
}

function parseContentLength(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function createRequestOptions(
  target: SafeRemoteMediaTarget,
  options: ResolvedRemoteMediaDownloadOptions,
  signal: AbortSignal,
): RequestOptions {
  const url = target.url;

  const requestOptions: RequestOptions = {
    protocol: url.protocol,

    /*
     * Network connection langsung menuju IP
     * yang sudah di-resolve dan divalidasi.
     *
     * Tidak ada DNS lookup kedua.
     */
    hostname: target.address.address,

    family: target.address.family,

    port: url.port || undefined,

    method: "GET",

    path: `${url.pathname}${url.search}`,

    signal,

    headers: {
      /*
       * HTTP Host tetap menggunakan hostname
       * original agar virtual hosting bekerja.
       */
      Host: url.host,

      Accept: options.accept,

      "User-Agent": options.userAgent,
    },
  };

  if (url.protocol === "https:") {
    /*
     * Walaupun TCP connect menuju IP,
     * TLS certificate + SNI tetap diverifikasi
     * terhadap hostname original.
     */
    requestOptions.servername = url.hostname;
  }

  return requestOptions;
}

function requestPinnedTarget(
  target: SafeRemoteMediaTarget,
  options: ResolvedRemoteMediaDownloadOptions,
): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, options.timeoutMs);

    const requestOptions = createRequestOptions(
      target,
      options,
      controller.signal,
    );

    const onResponse = (response: IncomingMessage) => {
      clearTimeout(timeout);

      response.setTimeout(options.timeoutMs, () => {
        response.destroy(new Error("MEDIA_DOWNLOAD_TIMEOUT"));
      });

      resolve(response);
    };

    const request =
      target.url.protocol === "https:"
        ? httpsRequest(requestOptions, onResponse)
        : httpRequest(requestOptions, onResponse);

    request.on("error", (error) => {
      clearTimeout(timeout);

      if (controller.signal.aborted) {
        reject(new Error("MEDIA_DOWNLOAD_TIMEOUT"));

        return;
      }

      reject(error);
    });

    request.end();
  });
}

async function fetchWithSafeRedirects(
  inputUrl: string,
  options: ResolvedRemoteMediaDownloadOptions,
): Promise<SafeRemoteResponse> {
  let currentUrl = inputUrl;

  for (
    let redirectCount = 0;
    redirectCount <= options.maxRedirects;
    redirectCount += 1
  ) {
    /*
     * Setiap hop:
     *
     * URL
     * ↓
     * DNS resolve
     * ↓
     * seluruh IP divalidasi
     * ↓
     * pilih safe IP
     * ↓
     * TCP/TLS connect langsung ke IP itu
     */
    const target = await assertSafeRemoteMediaUrl(currentUrl);

    const response = await requestPinnedTarget(target, options);

    const status = response.statusCode ?? 0;

    if (status >= 300 && status < 400) {
      const location = response.headers.location;

      response.destroy();

      if (!location) {
        throw new Error("MEDIA_REDIRECT_LOCATION_MISSING");
      }

      if (redirectCount === options.maxRedirects) {
        throw new Error("MEDIA_TOO_MANY_REDIRECTS");
      }

      currentUrl = new URL(location, target.url).toString();

      continue;
    }

    return {
      response,

      finalUrl: target.url.toString(),
    };
  }

  throw new Error("MEDIA_TOO_MANY_REDIRECTS");
}

export async function downloadRemoteMedia(
  inputUrl: string,
  options: RemoteMediaDownloadOptions = {},
): Promise<DownloadedRemoteMedia> {
  const resolvedOptions = resolveDownloadOptions(options);

  const temporaryDirectory = await mkdtemp(join(tmpdir(), "nexora-media-"));

  const filePath = join(temporaryDirectory, "media-source");

  try {
    const { response, finalUrl } = await fetchWithSafeRedirects(
      inputUrl,
      resolvedOptions,
    );

    const status = response.statusCode ?? 0;

    if (status < 200 || status >= 300) {
      response.destroy();

      throw new Error(`MEDIA_DOWNLOAD_FAILED_${status}`);
    }

    const rawContentLength = response.headers["content-length"];

    const declaredContentLength = parseContentLength(
      typeof rawContentLength === "string" ? rawContentLength : undefined,
    );

    if (
      declaredContentLength !== null &&
      declaredContentLength > resolvedOptions.maxBytes
    ) {
      response.destroy();

      throw new Error("MEDIA_FILE_TOO_LARGE");
    }

    const fileHandle = await open(filePath, "w");

    let downloadedBytes = 0;

    try {
      for await (const chunk of response) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

        downloadedBytes += buffer.byteLength;

        if (downloadedBytes > resolvedOptions.maxBytes) {
          response.destroy();

          throw new Error("MEDIA_FILE_TOO_LARGE");
        }

        await fileHandle.write(buffer);
      }
    } finally {
      await fileHandle.close();
    }

    if (downloadedBytes === 0) {
      throw new Error("MEDIA_FILE_EMPTY");
    }

    return {
      originalUrl: inputUrl,

      finalUrl,

      filePath,

      contentType: normalizeContentType(response.headers["content-type"]),

      contentLength: downloadedBytes,

      cleanup: async () => {
        await rm(temporaryDirectory, {
          recursive: true,
          force: true,
        });
      },
    };
  } catch (error) {
    await rm(temporaryDirectory, {
      recursive: true,
      force: true,
    });

    throw error;
  }
}
