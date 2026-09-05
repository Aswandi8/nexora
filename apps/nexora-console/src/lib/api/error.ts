import type { ApiErrorDetail } from "@nexora/contracts/api";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;

  constructor(status: number, error: ApiErrorDetail) {
    super(error.message);

    this.name = "ApiRequestError";
    this.status = status;
    this.code = error.code;
    this.fields = error.fields;
  }
}

export type ApiNetworkErrorReason = "NETWORK" | "TIMEOUT" | "ABORTED";

export class ApiNetworkError extends Error {
  readonly reason: ApiNetworkErrorReason;
  readonly cause?: unknown;

  constructor(
    message = "Tidak dapat terhubung ke Nexora Core.",
    reason: ApiNetworkErrorReason = "NETWORK",
    cause?: unknown,
  ) {
    super(message);

    this.name = "ApiNetworkError";
    this.reason = reason;
    this.cause = cause;
  }
}

export class ApiResponseError extends Error {
  readonly status: number;

  constructor(
    status: number,
    message = "Nexora Core mengembalikan response yang tidak valid.",
  ) {
    super(message);

    this.name = "ApiResponseError";
    this.status = status;
  }
}
