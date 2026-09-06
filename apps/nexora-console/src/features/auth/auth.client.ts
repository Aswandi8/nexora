import {
  AuthAccountRejectedError,
  decideAuthContext,
} from "./auth-login-policy";

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInResult {
  redirect: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

interface BetterAuthErrorResponse {
  message?: string;
  code?: string;
}

interface AuthContextFailure {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

const AUTH_REQUEST_TIMEOUT_MS = 15_000;

/*
 * Total enam verification attempts.
 *
 * Request pertama langsung dilakukan. Delay hanya digunakan sebelum
 * request berikutnya:
 *
 * 150ms
 * 300ms
 * 500ms
 * 750ms
 * 1000ms
 *
 * Total backoff nominal = 2.7 detik.
 */
const SESSION_READY_DELAYS_MS = [150, 300, 500, 750, 1_000] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function authFetch(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(path, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Layanan autentikasi membutuhkan waktu terlalu lama. Silakan coba lagi.",
      );
    }

    throw new Error(
      "Layanan autentikasi tidak dapat dihubungi. Silakan coba lagi.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function readBetterAuthError(
  response: Response,
): Promise<BetterAuthErrorResponse> {
  try {
    return (await response.json()) as BetterAuthErrorResponse;
  } catch {
    return {};
  }
}

async function readAuthContextFailure(
  response: Response,
): Promise<AuthContextFailure | null> {
  try {
    const payload = (await response.json()) as unknown;

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("success" in payload) ||
      payload.success !== false ||
      !("error" in payload)
    ) {
      return null;
    }

    const error = payload.error;

    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      typeof error.code !== "string" ||
      !("message" in error) ||
      typeof error.message !== "string"
    ) {
      return null;
    }

    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  } catch {
    return null;
  }
}

async function parseBetterAuthError(response: Response): Promise<Error> {
  if (response.status === 401) {
    return new Error("Email atau password tidak benar.");
  }

  if (response.status === 403) {
    return new Error("Akun Anda tidak memiliki akses ke Nexora Console.");
  }

  if (response.status === 429) {
    return new Error(
      "Terlalu banyak percobaan. Tunggu sebentar lalu coba kembali.",
    );
  }

  if (response.status === 503) {
    return new Error(
      "Layanan autentikasi sedang tidak tersedia. Silakan coba lagi.",
    );
  }

  if (response.status >= 500) {
    return new Error(
      "Terjadi gangguan pada layanan autentikasi. Silakan coba lagi.",
    );
  }

  const payload = await readBetterAuthError(response);

  if (payload.code === "INVALID_EMAIL_OR_PASSWORD") {
    return new Error("Email atau password tidak benar.");
  }

  return new Error(
    payload.message || "Permintaan autentikasi tidak dapat diproses.",
  );
}

async function parseResetPasswordError(response: Response): Promise<Error> {
  if (response.status === 429) {
    return new Error(
      "Terlalu banyak percobaan. Tunggu sebentar lalu coba kembali.",
    );
  }

  if (response.status === 503) {
    return new Error(
      "Layanan autentikasi sedang tidak tersedia. Silakan coba lagi.",
    );
  }

  if (response.status >= 500) {
    return new Error(
      "Terjadi gangguan saat mengatur password. Silakan coba lagi.",
    );
  }

  const payload = await readBetterAuthError(response);

  if (
    payload.code === "INVALID_TOKEN" ||
    payload.code === "INVALID_RESET_PASSWORD_TOKEN"
  ) {
    return new Error(
      "Link undangan tidak valid atau sudah kedaluwarsa. Minta administrator mengirim ulang undangan.",
    );
  }

  if (
    payload.code === "PASSWORD_TOO_SHORT" ||
    payload.code === "PASSWORD_TOO_LONG"
  ) {
    return new Error("Password harus terdiri dari 8 sampai 128 karakter.");
  }

  return new Error(
    payload.message || "Password tidak dapat disimpan. Silakan coba lagi.",
  );
}

async function clearSignInSession(): Promise<void> {
  try {
    await signOut();
  } catch {
    /*
     * Best-effort cleanup.
     *
     * Cleanup hanya dipanggil untuk definitive account rejection.
     * Error cleanup tidak boleh menggantikan error policy akun utama.
     */
  }
}

/*
 * Return:
 *
 * true  = session/context sudah terverifikasi.
 * false = kondisi transient; boleh dicoba kembali.
 *
 * Throw AuthAccountRejectedError hanya untuk definitive account rejection.
 */
async function validateSignedInAccount(): Promise<boolean> {
  const response = await authFetch("/api/auth/context", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.ok) {
    return true;
  }

  const payload = await readAuthContextFailure(response);

  const decision = decideAuthContext({
    status: response.status,
    code: payload?.error.code,
    message: payload?.error.message,
  });

  if (decision.kind === "ready") {
    return true;
  }

  if (decision.kind === "reject") {
    throw new AuthAccountRejectedError(decision.message);
  }

  return false;
}

/*
 * Penting:
 *
 * POST sign-in yang sukses adalah bukti utama credential diterima dan
 * session response telah dibuat.
 *
 * /api/auth/context sesudahnya hanya readiness verification.
 *
 * Jika seluruh verification attempt terkena transient error, fungsi ini
 * selesai tanpa error. Browser kemudian membuka /dashboard dan security
 * gate server-side pada dashboard menjadi final authority.
 */
async function waitForSignedInSession(): Promise<void> {
  const attemptCount = SESSION_READY_DELAYS_MS.length + 1;

  for (let attempt = 0; attempt < attemptCount; attempt += 1) {
    try {
      const ready = await validateSignedInAccount();

      if (ready) {
        return;
      }
    } catch (error) {
      if (error instanceof AuthAccountRejectedError) {
        throw error;
      }

      /*
       * Network failure, timeout, dan transient proxy failure tidak
       * membatalkan sign-in yang sebelumnya sudah berhasil.
       */
    }

    if (attempt < SESSION_READY_DELAYS_MS.length) {
      await sleep(SESSION_READY_DELAYS_MS[attempt]);
    }
  }

  /*
   * Verification belum siap, tetapi sign-in sudah sukses.
   *
   * Jangan sign-out dan jangan tampilkan false-negative.
   * /dashboard akan memverifikasi session melalui server component.
   */
}

export async function signInWithEmail(
  input: SignInInput,
): Promise<SignInResult> {
  const response = await authFetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });

  /*
   * Sign-in request sendiri tetap authoritative.
   *
   * Credential salah, rate limit, atau Core gagal pada POST ini tetap
   * dianggap login failure.
   */
  if (!response.ok) {
    throw await parseBetterAuthError(response);
  }

  const result = (await response.json()) as SignInResult;

  try {
    await waitForSignedInSession();
  } catch (error) {
    /*
     * Hanya definitive account-policy rejection yang sampai ke sini.
     * Session harus dibersihkan supaya akun inactive/suspended/forbidden
     * tidak meninggalkan session aktif pada browser.
     */
    if (error instanceof AuthAccountRejectedError) {
      await clearSignInSession();
    }

    throw error;
  }

  return result;
}

export async function resetPassword({
  token,
  newPassword,
}: ResetPasswordInput): Promise<void> {
  const response = await authFetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      token,
      newPassword,
    }),
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw await parseResetPasswordError(response);
  }
}

export async function signOut(): Promise<void> {
  const response = await authFetch("/api/auth/sign-out", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw await parseBetterAuthError(response);
  }
}
