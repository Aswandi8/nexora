"use client";

import { CheckCircle2, KeyRound, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { WorkspaceLoading } from "@/components/feedback/workspace-loading";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { Typography } from "@/components/ui/typography";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { resetPassword } from "./auth.client";

interface AcceptInvitationFormProps {
  token?: string;
  error?: string;
}

function getInvitationError(error?: string): string | null {
  if (!error) {
    return null;
  }

  if (error === "INVALID_TOKEN" || error === "INVALID_RESET_PASSWORD_TOKEN") {
    return "Link undangan tidak valid atau sudah kedaluwarsa. Hubungi administrator untuk mengirim ulang undangan.";
  }

  return "Link undangan tidak dapat digunakan. Hubungi administrator untuk mendapatkan undangan baru.";
}

export function AcceptInvitationForm({
  token,
  error,
}: AcceptInvitationFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const invitationError =
    getInvitationError(error) ??
    (!token
      ? "Token undangan tidak ditemukan. Gunakan link terbaru yang dikirim melalui email."
      : null);

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || invitationError || isSubmitting || isCompleted) {
      return;
    }

    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = "Password minimal 8 karakter.";
    } else if (password.length > 128) {
      errors.password = "Password maksimal 128 karakter.";
    }

    if (!confirmation) {
      errors.confirmation = "Konfirmasi password wajib diisi.";
    } else if (password !== confirmation) {
      errors.confirmation = "Konfirmasi password tidak sama.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        newPassword: password,
      });

      setIsCompleted(true);

      toast({
        title: "Akun berhasil diaktifkan",
        description:
          "Password berhasil dibuat dan email Anda telah terverifikasi.",
        variant: "success",
      });
    } catch (requestError) {
      setIsSubmitting(false);

      toast({
        title: "Aktivasi gagal",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Akun tidak dapat diaktifkan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  }

  if (invitationError) {
    return (
      <div className="grid gap-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />

            <div className="min-w-0">
              <Typography as="p" variant="h4">
                Undangan tidak dapat digunakan
              </Typography>

              <Typography variant="muted" className="mt-1 leading-6">
                {invitationError}
              </Typography>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "lg",
            }),
            "h-12 w-full rounded-xl",
          )}
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="grid gap-6">
        <div className="rounded-xl border border-border bg-secondary/30 p-5">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="size-5" />
            </div>

            <div className="min-w-0">
              <Typography as="p" variant="h4">
                Akun siap digunakan
              </Typography>

              <Typography variant="muted" className="mt-1 leading-6">
                Password berhasil dibuat. Anda sekarang dapat masuk menggunakan
                email dan password baru.
              </Typography>
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="h-12 w-full rounded-xl bg-brand-300 text-base font-semibold text-brand-900 hover:bg-brand-500"
          onClick={() => router.replace("/login")}
        >
          Masuk ke Nexora
        </Button>
      </div>
    );
  }

  return (
    <>
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-brand-300" />

            <Typography variant="muted" className="leading-6">
              Buat password untuk menyelesaikan aktivasi akun Nexora Anda.
              Password ini hanya diketahui oleh Anda.
            </Typography>
          </div>
        </div>

        <FormField
          label="Password baru"
          htmlFor="new-password"
          description="Gunakan minimal 8 karakter."
          error={fieldErrors.password}
        >
          <PasswordInput
            id="new-password"
            name="new-password"
            autoComplete="new-password"
            placeholder="Buat password baru"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </FormField>

        <FormField
          label="Konfirmasi password"
          htmlFor="confirm-password"
          error={fieldErrors.confirmation}
        >
          <PasswordInput
            id="confirm-password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Ulangi password baru"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="mt-1 h-12 w-full rounded-xl bg-brand-300 text-base font-semibold text-brand-900 shadow-[0_8px_24px_-12px_var(--brand-300)] transition-all hover:bg-brand-500 hover:shadow-[0_10px_30px_-12px_var(--brand-500)]"
        >
          {isSubmitting ? "Mengaktifkan akun..." : "Aktifkan akun"}
        </Button>
      </form>

      {isSubmitting ? <WorkspaceLoading /> : null}
    </>
  );
}
