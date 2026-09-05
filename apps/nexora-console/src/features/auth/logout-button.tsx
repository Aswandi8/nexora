"use client";

import { useState } from "react";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";

import { signOut } from "./auth.client";

interface LogoutButtonProps {
  variant?: "button" | "menu";
  className?: string;
}

export function LogoutButton({
  variant = "button",
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signOut();

      toast({
        title: "Berhasil keluar",
        description: "Sesi Nexora Anda telah berakhir.",
        variant: "success",
      });

      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast({
        title: "Gagal keluar",
        description:
          error instanceof Error
            ? error.message
            : "Proses keluar tidak dapat diselesaikan.",
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  }

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <LogOut aria-hidden="true" className="size-4" />
        <span>{isSubmitting ? "Memproses..." : "Keluar"}</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isSubmitting}
      className={className}
    >
      <LogOut className="size-4" />
      {isSubmitting ? "Memproses..." : "Keluar"}
    </Button>
  );
}
