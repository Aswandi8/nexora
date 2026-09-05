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
const SESSION_READY_ATTEMPTS = 5;
const SESSION_READY_DELAY_MS = 250;

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
    // Best-effort cleanup. Error utama tetap status akun.
  }
}

async function validateSignedInAccount(): Promise<void> {
  const response = await authFetch("/api/auth/context", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.ok) {
    return;
  }

  const payload = await readAuthContextFailure(response);

  if (payload?.error.code === "ACCOUNT_INACTIVE") {
    throw new Error(
      "Akun Anda tidak aktif. Hubungi administrator untuk mengaktifkan kembali akun.",
    );
  }

  if (payload?.error.code === "ACCOUNT_SUSPENDED") {
    throw new Error(
      "Akun Anda ditangguhkan. Hubungi administrator untuk informasi lebih lanjut.",
    );
  }

  if (response.status === 401) {
    throw new Error(
      "Sesi login tidak dapat dibuat. Silakan coba masuk kembali.",
    );
  }

  if (response.status === 403) {
    throw new Error("Akun Anda tidak memiliki akses ke Nexora Console.");
  }

  if (response.status === 429) {
    throw new Error(
      "Terlalu banyak permintaan. Tunggu sebentar lalu coba kembali.",
    );
  }

  if (response.status >= 500) {
    throw new Error(
      "Terjadi gangguan saat memverifikasi akun. Silakan coba lagi.",
    );
  }

  throw new Error(
    payload?.error.message || "Status akun tidak dapat diverifikasi.",
  );
}

async function waitForSignedInSession(): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= SESSION_READY_ATTEMPTS; attempt += 1) {
    try {
      await validateSignedInAccount();
      return;
    } catch (error) {
      lastError = error;

      if (
        error instanceof Error &&
        (error.message.includes("tidak aktif") ||
          error.message.includes("ditangguhkan") ||
          error.message.includes("tidak memiliki akses"))
      ) {
        throw error;
      }

      if (attempt < SESSION_READY_ATTEMPTS) {
        await sleep(SESSION_READY_DELAY_MS);
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Sesi login tidak dapat dibuat. Silakan coba masuk kembali.");
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

  if (!response.ok) {
    throw await parseBetterAuthError(response);
  }

  const result = (await response.json()) as SignInResult;

  try {
    await waitForSignedInSession();
  } catch (error) {
    await clearSignInSession();
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
