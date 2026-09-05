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

interface BetterAuthErrorResponse {
  message?: string;
  code?: string;
}

const AUTH_REQUEST_TIMEOUT_MS = 15_000;

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

  try {
    const payload = (await response.json()) as BetterAuthErrorResponse;

    if (payload.code === "INVALID_EMAIL_OR_PASSWORD") {
      return new Error("Email atau password tidak benar.");
    }

    return new Error(
      payload.message || "Permintaan autentikasi tidak dapat diproses.",
    );
  } catch {
    return new Error("Permintaan autentikasi tidak dapat diproses.");
  }
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

  return response.json() as Promise<SignInResult>;
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
