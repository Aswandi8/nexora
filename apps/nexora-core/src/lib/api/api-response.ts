import {
  API_ERROR_CODES,
  type ApiErrorCode,
  type ApiResponse,
} from "@nexora/contracts";

import { Prisma } from "@/generated/prisma/client";
import { logger } from "@/lib/observability/logger";

import { ZodError } from "zod";

function createErrorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string[]>,
): Response {
  const body: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      ...(fields ? { fields } : {}),
    },
  };

  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
    },
  });
}

export function apiSuccess<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };

  return Response.json(body, {
    status,
  });
}

function mapZodFields(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";

    fields[key] ??= [];
    fields[key].push(issue.message);
  }

  return fields;
}

function mapKnownApplicationError(error: Error): Response | null {
  switch (error.message) {
    case "AUTH_REQUIRED":
      return createErrorResponse(
        401,
        API_ERROR_CODES.AUTH_REQUIRED,
        "Autentikasi diperlukan.",
      );

    case "ACCOUNT_INACTIVE":
      return createErrorResponse(
        403,
        API_ERROR_CODES.ACCOUNT_INACTIVE,
        "Akun tidak aktif.",
      );

    case "FORBIDDEN":
      return createErrorResponse(
        403,
        API_ERROR_CODES.FORBIDDEN,
        "Anda tidak memiliki izin untuk melakukan tindakan ini.",
      );

    case "SHORTLINK_NOT_FOUND":
      return createErrorResponse(
        404,
        API_ERROR_CODES.NOT_FOUND,
        "Shortlink tidak ditemukan.",
      );

    case "ROLE_NOT_FOUND":
      return createErrorResponse(
        404,
        API_ERROR_CODES.NOT_FOUND,
        "Role tidak ditemukan.",
      );

    case "SUPER_ADMIN_ROLE_UPDATE":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Role Super Admin dilindungi dan tidak dapat diubah.",
      );

    case "SUPER_ADMIN_ROLE_DELETE":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Role Super Admin dilindungi dan tidak dapat dihapus.",
      );

    case "SYSTEM_ROLE_CODE_RESERVED":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Kode role tersebut dicadangkan oleh sistem.",
      );

    case "SYSTEM_ROLE_DELETE":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "System role tidak dapat dihapus.",
      );

    case "SYSTEM_ROLE_CODE_UPDATE":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Kode system role tidak dapat diubah.",
      );

    case "USER_NOT_FOUND":
      return createErrorResponse(
        404,
        API_ERROR_CODES.NOT_FOUND,
        "User tidak ditemukan.",
      );

    case "USER_EMAIL_EXISTS":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Email tersebut sudah digunakan oleh user lain.",
      );

    case "USER_ROLE_NOT_FOUND":
      return createErrorResponse(
        422,
        API_ERROR_CODES.VALIDATION_ERROR,
        "Role yang dipilih tidak ditemukan.",
      );

    case "USER_CREATION_FAILED":
      return createErrorResponse(
        500,
        API_ERROR_CODES.INTERNAL_ERROR,
        "Akun user tidak dapat dibuat.",
      );

    case "SUPER_ADMIN_USER_ASSIGNMENT_FORBIDDEN":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Role Super Admin tidak dapat diberikan melalui manajemen user biasa.",
      );

    case "SUPER_ADMIN_USER_STATUS_UPDATE":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Status akun Super Admin dilindungi dan tidak dapat diubah.",
      );

    case "SUPER_ADMIN_USER_ROLES_UPDATE":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Role akun Super Admin dilindungi dan tidak dapat diubah.",
      );

    case "SUPER_ADMIN_USER_DELETE":
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Akun Super Admin dilindungi dan tidak dapat dihapus.",
      );

    case "MEDIA_URL_INVALID":
    case "MEDIA_URL_PROTOCOL_NOT_ALLOWED":
    case "MEDIA_URL_CREDENTIALS_NOT_ALLOWED":
    case "MEDIA_URL_PRIVATE_HOST_NOT_ALLOWED":
    case "MEDIA_URL_PRIVATE_IP_NOT_ALLOWED":
      return createErrorResponse(
        422,
        API_ERROR_CODES.VALIDATION_ERROR,
        "Media URL tidak diizinkan.",
      );

    case "MEDIA_FILE_TOO_LARGE":
      return createErrorResponse(
        413,
        API_ERROR_CODES.VALIDATION_ERROR,
        "Ukuran media melebihi batas yang diizinkan.",
      );

    case "MEDIA_FILE_EMPTY":
    case "UNSUPPORTED_MEDIA_TYPE":
    case "IMAGE_DIMENSIONS_NOT_FOUND":
    case "VIDEO_STREAM_NOT_FOUND":
    case "VIDEO_DIMENSIONS_NOT_FOUND":
      return createErrorResponse(
        422,
        API_ERROR_CODES.VALIDATION_ERROR,
        "Media tidak valid atau tidak didukung.",
      );

    case "MEDIA_TOO_MANY_REDIRECTS":
    case "MEDIA_REDIRECT_LOCATION_MISSING":
    case "MEDIA_URL_HOST_NOT_RESOLVED":
    case "MEDIA_DOWNLOAD_TIMEOUT":
    case "FFPROBE_TIMEOUT":
      return createErrorResponse(
        502,
        API_ERROR_CODES.EXTERNAL_API_ERROR,
        "Media remote tidak dapat diperiksa.",
      );

    case "FFPROBE_BINARY_NOT_FOUND":
    case "FFPROBE_INVALID_OUTPUT":
      return createErrorResponse(
        500,
        API_ERROR_CODES.INTERNAL_ERROR,
        "Layanan pemeriksaan media tidak tersedia.",
      );

    default:
      if (error.message.startsWith("MEDIA_DOWNLOAD_FAILED_")) {
        return createErrorResponse(
          502,
          API_ERROR_CODES.EXTERNAL_API_ERROR,
          "Media remote tidak dapat diunduh.",
        );
      }

      return null;
  }
}

export function apiError(error: unknown): Response {
  if (error instanceof ZodError) {
    return createErrorResponse(
      422,
      API_ERROR_CODES.VALIDATION_ERROR,
      "Data yang dikirim tidak valid.",
      mapZodFields(error),
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Data dengan nilai tersebut sudah ada.",
      );
    }

    if (error.code === "P2003") {
      return createErrorResponse(
        409,
        API_ERROR_CODES.CONFLICT,
        "Data masih digunakan oleh data lain dan tidak dapat diproses.",
      );
    }

    if (error.code === "P2025") {
      return createErrorResponse(
        404,
        API_ERROR_CODES.NOT_FOUND,
        "Data tidak ditemukan.",
      );
    }

    logger.error("api.database.failed", {
      prismaCode: error.code,
      errorName: error.name,
    });

    return createErrorResponse(
      500,
      API_ERROR_CODES.DATABASE_ERROR,
      "Terjadi kesalahan database.",
    );
  }

  if (error instanceof Error) {
    const response = mapKnownApplicationError(error);

    if (response) {
      return response;
    }

    logger.error("api.unhandled-error", {
      error,
    });
  } else {
    logger.error("api.unhandled-error", {
      errorType: typeof error,
    });
  }

  return createErrorResponse(
    500,
    API_ERROR_CODES.INTERNAL_ERROR,
    "Terjadi kesalahan internal pada server.",
  );
}
