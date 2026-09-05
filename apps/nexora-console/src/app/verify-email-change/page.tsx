import { CheckCircle2, XCircle } from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { Typography } from "@/components/ui/typography";

import { env } from "@/config/env";

interface VerifyEmailChangePageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

interface VerifyResult {
  verified: boolean;
  email: string;
}

async function verifyEmailChange(token: string): Promise<
  | {
      success: true;
      data: VerifyResult;
    }
  | {
      success: false;
    }
> {
  try {
    const response = await fetch(
      `${env.NEXORA_CORE_URL}/api/account/email/verify?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        success: false,
      };
    }

    const body = await response.json();

    if (!body?.success || !body?.data?.verified) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      data: body.data,
    };
  } catch {
    return {
      success: false,
    };
  }
}

export default async function VerifyEmailChangePage({
  searchParams,
}: VerifyEmailChangePageProps) {
  const { token } = await searchParams;

  const result = token
    ? await verifyEmailChange(token)
    : {
        success: false as const,
      };

  if (!result.success) {
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
            Link verifikasi tidak valid atau sudah kedaluwarsa.
          </Typography>

          <Button className="mt-6 w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </Card>
      </main>
    );
  }

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
          Email akun Nexora Anda berhasil diubah menjadi{" "}
          <span className="font-medium text-foreground">
            {result.data.email}
          </span>
          .
        </Typography>

        <Typography variant="muted" className="mt-2">
          Semua session lama telah dihentikan. Silakan masuk kembali menggunakan
          email baru.
        </Typography>

        <Button className="mt-6 w-full">
          <Link href="/login">Sign In</Link>
        </Button>
      </Card>
    </main>
  );
}
