import { createHash, randomBytes } from "node:crypto";

import {
  requestAccountEmailChangeSchema,
  type AccountEmailSecurity,
  type CancelAccountEmailChangeResult,
  type RequestAccountEmailChangeResult,
  type ResendAccountEmailChangeResult,
  type VerifyAccountEmailChangeResult,
} from "@nexora/contracts";

import { auth } from "@/auth/auth";
import { sendEmailChangeVerification } from "@/lib/email/email-change-email";

import { accountEmailRepository } from "./account-email.repository";

const EMAIL_CHANGE_EXPIRY_MS = 60 * 60 * 1000;

type VerifiedEmailChange = VerifyAccountEmailChangeResult & {
  audit: {
    userId: string;
    name: string;
    previousEmail: string;
  };
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getConsoleUrl(): string {
  const value = process.env.NEXORA_CONSOLE_URL?.trim();

  if (!value) {
    throw new Error("NEXORA_CONSOLE_URL is not configured");
  }

  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXORA_CONSOLE_URL must use http or https");
  }

  return url.origin;
}

function createVerificationUrl(token: string): string {
  const url = new URL("/verify-email-change", getConsoleUrl());

  url.searchParams.set("token", token);

  return url.toString();
}

export async function getOwnEmailSecurity(
  userId: string,
): Promise<AccountEmailSecurity> {
  const user = await accountEmailRepository.findSecurityState(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const pending =
    user.emailChange && user.emailChange.expiresAt > new Date()
      ? user.emailChange
      : null;

  return {
    email: user.email,
    emailVerified: user.emailVerified,
    pendingChange: pending
      ? {
          pendingEmail: pending.newEmail,
          expiresAt: pending.expiresAt.toISOString(),
        }
      : null,
  };
}

export async function requestOwnEmailChange(
  headers: Headers,
  userId: string,
  currentEmail: string,
  name: string,
  input: unknown,
): Promise<RequestAccountEmailChangeResult> {
  const data = requestAccountEmailChangeSchema.parse(input);
  const normalizedEmail = normalizeEmail(data.newEmail);

  if (normalizedEmail === normalizeEmail(currentEmail)) {
    throw new Error("EMAIL_UNCHANGED");
  }

  await auth.api.verifyPassword({
    headers,
    body: {
      password: data.currentPassword,
    },
  });

  const existing = await accountEmailRepository.findEmailOwner(normalizedEmail);

  if (existing && existing.id !== userId) {
    throw new Error("EMAIL_UNAVAILABLE");
  }

  const token = createToken();
  const expiresAt = new Date(Date.now() + EMAIL_CHANGE_EXPIRY_MS);

  const pending = await accountEmailRepository.upsertPending({
    userId,
    newEmail: normalizedEmail,
    tokenHash: hashToken(token),
    expiresAt,
  });

  await sendEmailChangeVerification({
    to: normalizedEmail,
    name,
    verificationUrl: createVerificationUrl(token),
  });

  return {
    pendingChange: {
      pendingEmail: pending.newEmail,
      expiresAt: pending.expiresAt.toISOString(),
    },
  };
}

export async function resendOwnEmailChange(
  userId: string,
): Promise<ResendAccountEmailChangeResult> {
  const pending = await accountEmailRepository.findPendingByUserId(userId);

  if (!pending) {
    throw new Error("EMAIL_CHANGE_NOT_FOUND");
  }

  const existing = await accountEmailRepository.findEmailOwner(
    pending.newEmail,
  );

  if (existing && existing.id !== userId) {
    throw new Error("EMAIL_UNAVAILABLE");
  }

  const token = createToken();
  const expiresAt = new Date(Date.now() + EMAIL_CHANGE_EXPIRY_MS);

  const updated = await accountEmailRepository.updateToken(
    pending.id,
    hashToken(token),
    expiresAt,
  );

  await sendEmailChangeVerification({
    to: updated.newEmail,
    name: pending.user.name,
    verificationUrl: createVerificationUrl(token),
  });

  return {
    pendingChange: {
      pendingEmail: updated.newEmail,
      expiresAt: updated.expiresAt.toISOString(),
    },
  };
}

export async function cancelOwnEmailChange(
  userId: string,
): Promise<CancelAccountEmailChangeResult> {
  const result = await accountEmailRepository.cancel(userId);

  return {
    cancelled: result.count > 0,
  };
}

export async function verifyOwnEmailChange(
  token: string,
): Promise<VerifiedEmailChange> {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new Error("EMAIL_CHANGE_TOKEN_INVALID");
  }

  const pending = await accountEmailRepository.findPendingByTokenHash(
    hashToken(normalizedToken),
  );

  if (!pending) {
    throw new Error("EMAIL_CHANGE_TOKEN_INVALID");
  }

  if (pending.expiresAt <= new Date()) {
    await accountEmailRepository.cancel(pending.userId);

    throw new Error("EMAIL_CHANGE_TOKEN_EXPIRED");
  }

  const previousEmail = pending.user.email;

  const user = await accountEmailRepository.verify(
    pending.id,
    pending.userId,
    pending.newEmail,
  );

  return {
    verified: true,
    email: user.email,
    audit: {
      userId: user.id,
      name: user.name,
      previousEmail,
    },
  };
}
