"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/providers/theme-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
