export type InspectedMediaType = "IMAGE" | "VIDEO";

export type InspectedMedia = {
  mediaType: InspectedMediaType;
  mediaWidth: number;
  mediaHeight: number;
  durationMs: number | null;
  mimeType: string | null;
  contentLength: number | null;
};

export type RemoteMediaDownloadOptions = {
  maxBytes?: number;
  timeoutMs?: number;
  maxRedirects?: number;
  accept?: string;
  userAgent?: string;
};

export type SafeRemoteMediaAddress = {
  address: string;
  family: 4 | 6;
};

export type SafeRemoteMediaTarget = {
  url: URL;
  address: SafeRemoteMediaAddress;
};

export type DownloadedRemoteMedia = {
  originalUrl: string;
  finalUrl: string;
  filePath: string;
  contentType: string | null;
  contentLength: number;
  cleanup: () => Promise<void>;
};
