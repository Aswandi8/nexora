export type AuthContextDecision =
  | {
      kind: "ready";
    }
  | {
      kind: "retry";
    }
  | {
      kind: "reject";
      message: string;
    };

export interface AuthContextState {
  status: number;
  code?: string;
  message?: string;
}

export class AuthAccountRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthAccountRejectedError";
  }
}

export function decideAuthContext({
  status,
  code,
}: AuthContextState): AuthContextDecision {
  if (status >= 200 && status < 300) {
    return {
      kind: "ready",
    };
  }

  if (code === "ACCOUNT_INACTIVE") {
    return {
      kind: "reject",
      message:
        "Akun Anda tidak aktif. Hubungi administrator untuk mengaktifkan kembali akun.",
    };
  }

  if (code === "ACCOUNT_SUSPENDED") {
    return {
      kind: "reject",
      message:
        "Akun Anda ditangguhkan. Hubungi administrator untuk informasi lebih lanjut.",
    };
  }

  if (status === 403) {
    return {
      kind: "reject",
      message: "Akun Anda tidak memiliki akses ke Nexora Console.",
    };
  }

  /*
   * Setelah POST sign-in berhasil, kegagalan berikut tidak membuktikan
   * bahwa login gagal:
   *
   * - 401 session belum terbaca request berikutnya
   * - 429 transient rate limit
   * - 5xx Core/database/serverless transient failure
   * - response lain yang belum dapat memastikan policy akun
   *
   * Semua kondisi tersebut diperlakukan sebagai readiness retry.
   * Dashboard tetap melakukan server-side authorization sebelum render.
   */
  return {
    kind: "retry",
  };
}
