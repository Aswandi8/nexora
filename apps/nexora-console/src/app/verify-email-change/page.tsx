import { CheckCircle2, MailCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

interface VerifyEmailChangePageProps {
  searchParams: Promise<{
    token?: string;
    status?: string;
  }>;
}

async function verifyEmailChangeAction(formData: FormData) {
  "use server";

  const tokenValue = formData.get("token");
  const token = typeof tokenValue === "string" ? tokenValue.trim() : "";

  if (!token) {
    redirect("/verify-email-change?status=invalid");
  }

  try {
    const response = await fetch(
      `${env.NEXORA_CORE_URL}/api/account/email/verify`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      },
    );

    if (!response.ok) {
      redirect("/verify-email-change?status=failed");
    }

    const body = await response.json();

    if (!body?.success || !body?.data?.verified) {
      redirect("/verify-email-change?status=failed");
    }
  } catch {
    redirect("/verify-email-change?status=failed");
  }

  redirect("/verify-email-change?status=success");
}

function LoginLink({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/login" className={cn(buttonVariants(), "mt-6 w-full")}>
      {children}
    </Link>
  );
}

export default async function VerifyEmailChangePage({
  searchParams,
}: VerifyEmailChangePageProps) {
  const { token, status } = await searchParams;

  if (status === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-6 text-emerald-600" />
          </div>

          <Typography as="h1" variant="h3" className="mt-5">
            Email Verified
          </Typography>

          <Typography variant="muted" className="mt-2">
            Email akun Nexora Anda berhasil diubah.
          </Typography>

          <Typography variant="muted" className="mt-2">
            Semua session lama telah dihentikan. Silakan masuk kembali
            menggunakan email baru.
          </Typography>

          <LoginLink>Sign In</LoginLink>
        </Card>
      </main>
    );
  }

  if (status === "failed" || status === "invalid" || !token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="size-6" />
          </div>

          <Typography as="h1" variant="h3" className="mt-5">
            Verification Failed
          </Typography>

          <Typography variant="muted" className="mt-2">
            Link verifikasi tidak valid, sudah digunakan, atau sudah
            kedaluwarsa.
          </Typography>

          <LoginLink>Back to Login</LoginLink>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>

        <Typography as="h1" variant="h3" className="mt-5">
          Verify Email Change
        </Typography>

        <Typography variant="muted" className="mt-2">
          Konfirmasikan perubahan email akun Nexora Anda.
        </Typography>

        <Typography variant="muted" className="mt-2">
          Setelah verifikasi berhasil, semua session lama akan dihentikan dan
          Anda harus masuk kembali menggunakan email baru.
        </Typography>

        <form action={verifyEmailChangeAction} className="mt-6">
          <input type="hidden" name="token" value={token} />

          <Button type="submit" className="w-full">
            Verify Email
          </Button>
        </form>

        <Link
          href="/login"
          className={cn(
            buttonVariants({
              variant: "outline",
            }),
            "mt-3 w-full",
          )}
        >
          Cancel
        </Link>
      </Card>
    </main>
  );
}
