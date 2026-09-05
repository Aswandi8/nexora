import "server-only";

import type { ApiFailure, ApiResponse } from "@nexora/contracts/api";

import { ApiNetworkError, ApiRequestError, ApiResponseError } from "./error";

const DEFAULT_REQUEST_TIMEOUT_MS = 45_000;

export interface ApiClientOptions {
  baseUrl: string;
  defaultHeaders?: HeadersInit;
  timeoutMs?: number;
}

export interface ApiRequestOptions extends Omit<
  RequestInit,
  "body" | "signal"
> {
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

interface RequestAbortContext {
  signal: AbortSignal;
  timedOut(): boolean;
  cleanup(): void;
}

function createUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function isApiFailure(value: unknown): value is ApiFailure {
  if (
    typeof value !== "object" ||
    value === null ||
    !("success" in value) ||
    value.success !== false ||
    !("error" in value)
  ) {
    return false;
  }

  const error = value.error;

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (typeof value !== "object" || value === null || !("success" in value)) {
    return false;
  }

  if (value.success === false) {
    return isApiFailure(value);
  }

  return value.success === true && "data" in value;
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new ApiResponseError(
      response.status,
      "Nexora Core mengembalikan response non-JSON.",
    );
  }

  if (!isApiResponse<T>(payload)) {
    throw new ApiResponseError(response.status);
  }

  if (!payload.success) {
    throw new ApiRequestError(response.status, payload.error);
  }

  if (!response.ok) {
    throw new ApiResponseError(
      response.status,
      "Nexora Core mengembalikan response gagal tanpa API error.",
    );
  }

  return payload.data;
}

function resolveTimeoutMs(value: number | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  return fallback;
}

function createRequestAbortContext(
  parentSignal: AbortSignal | undefined,
  timeoutMs: number,
): RequestAbortContext {
  const controller = new AbortController();

  let timeoutTriggered = false;

  const abortFromParent = () => {
    controller.abort(parentSignal?.reason);
  };

  if (parentSignal?.aborted) {
    abortFromParent();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, {
      once: true,
    });
  }

  const timeout = setTimeout(() => {
    timeoutTriggered = true;
    controller.abort(new Error("API_REQUEST_TIMEOUT"));
  }, timeoutMs);

  return {
    signal: controller.signal,

    timedOut() {
      return timeoutTriggered;
    },

    cleanup() {
      clearTimeout(timeout);

      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");

  const defaultTimeoutMs = resolveTimeoutMs(
    options.timeoutMs,
    DEFAULT_REQUEST_TIMEOUT_MS,
  );

  return {
    async request<T>(
      path: string,
      requestOptions: ApiRequestOptions = {},
    ): Promise<T> {
      const {
        body: requestBody,
        signal: parentSignal,
        timeoutMs,
        ...fetchOptions
      } = requestOptions;

      const headers = new Headers(options.defaultHeaders);

      if (requestOptions.headers) {
        const requestHeaders = new Headers(requestOptions.headers);

        requestHeaders.forEach((value, key) => {
          headers.set(key, value);
        });
      }

      let body: BodyInit | undefined;

      if (requestBody !== undefined) {
        headers.set(
          "content-type",
          headers.get("content-type") ?? "application/json",
        );

        body = JSON.stringify(requestBody);
      }

      const abortContext = createRequestAbortContext(
        parentSignal,
        resolveTimeoutMs(timeoutMs, defaultTimeoutMs),
      );

      try {
        const response = await fetch(createUrl(baseUrl, path), {
          ...fetchOptions,
          headers,
          body,
          signal: abortContext.signal,
        });

        return await parseResponse<T>(response);
      } catch (error) {
        if (
          error instanceof ApiRequestError ||
          error instanceof ApiResponseError
        ) {
          throw error;
        }

        if (abortContext.timedOut()) {
          throw new ApiNetworkError(
            "Request ke Nexora Core melewati batas waktu.",
            "TIMEOUT",
            error,
          );
        }

        if (parentSignal?.aborted) {
          throw new ApiNetworkError(
            "Request ke Nexora Core dibatalkan.",
            "ABORTED",
            error,
          );
        }

        throw new ApiNetworkError(
          "Tidak dapat terhubung ke Nexora Core.",
          "NETWORK",
          error,
        );
      } finally {
        abortContext.cleanup();
      }
    },
  };
}
