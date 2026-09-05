import {
  ApiNetworkError,
  ApiRequestError,
  ApiResponseError,
} from "@/lib/api/error";

export interface ActionResult {
  success: boolean;
  message?: string;
  fields?: Record<string, string[]>;
}

export function actionFailure<T extends ActionResult = ActionResult>(
  error: unknown,
  fallback: string,
): T {
  if (error instanceof ApiRequestError) {
    return {
      success: false,
      message: getApiRequestMessage(error, fallback),
      fields: error.fields,
    } as T;
  }

  if (error instanceof ApiNetworkError) {
    return {
      success: false,
      message:
        error.reason === "TIMEOUT"
          ? "Permintaan membutuhkan waktu terlalu lama. Silakan coba lagi."
          : "Nexora Core tidak dapat dihubungi. Silakan coba lagi.",
    } as T;
  }

  if (error instanceof ApiResponseError) {
    return {
      success: false,
      message: "Nexora menerima respons yang tidak valid. Silakan coba lagi.",
    } as T;
  }

  return {
    success: false,
    message: fallback,
  } as T;
}

function getApiRequestMessage(
  error: ApiRequestError,
  fallback: string,
): string {
  if (error.status === 401) {
    return "Sesi Anda telah berakhir. Silakan masuk kembali.";
  }

  if (error.status === 403) {
    return "Anda tidak memiliki izin untuk melakukan tindakan ini.";
  }

  if (error.status === 404) {
    return "Data yang diminta tidak ditemukan.";
  }

  if (error.status === 409) {
    return error.message || "Data tersebut sudah digunakan.";
  }

  if (error.status === 429) {
    return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
  }

  if (error.status >= 500) {
    return "Layanan sedang mengalami gangguan. Silakan coba lagi.";
  }

  return error.message || fallback;
}
