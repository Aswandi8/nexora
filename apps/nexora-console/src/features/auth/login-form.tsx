"use client";

import { type FormEvent, useState } from "react";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { WorkspaceLoading } from "@/components/feedback/workspace-loading";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

import { useToast } from "@/hooks/use-toast";

import { signInWithEmail } from "./auth.client";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || isPreparing) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signInWithEmail({
        email,
        password,
      });

      setIsPreparing(true);

      toast({
        title: "Berhasil masuk",
        description: "Selamat datang kembali di Nexora Console.",
        variant: "success",
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast({
        title: "Gagal masuk",
        description:
          error instanceof Error
            ? error.message
            : "Autentikasi tidak dapat diproses.",
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  }

  if (isPreparing) {
    return <WorkspaceLoading />;
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <FormField label="Alamat email" htmlFor="email">
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="anda@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isSubmitting}
            className="h-12 rounded-xl border-border/80 bg-secondary/35 pl-10 text-sm shadow-none transition-all placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:ring-brand-400/20"
          />
        </div>
      </FormField>

      <FormField label="Password" htmlFor="password">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={isSubmitting}
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        className="mt-1 h-12 w-full rounded-xl bg-brand-300 text-base font-semibold text-brand-900 shadow-[0_8px_24px_-12px_var(--brand-300)] transition-all hover:bg-brand-500 hover:shadow-[0_10px_30px_-12px_var(--brand-500)]"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}
