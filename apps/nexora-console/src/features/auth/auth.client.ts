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

async function parseBetterAuthError(response: Response): Promise<Error> {
  try {
    const payload = (await response.json()) as BetterAuthErrorResponse;

    return new Error(payload.message || "Authentication request failed.");
  } catch {
    return new Error("Authentication request failed.");
  }
}

export async function signInWithEmail(
  input: SignInInput,
): Promise<SignInResult> {
  const response = await fetch("/api/auth/sign-in/email", {
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
  const response = await fetch("/api/auth/sign-out", {
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
