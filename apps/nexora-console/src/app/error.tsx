"use client";

import { ErrorPage } from "@/components/feedback/error-page";

interface ErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <ErrorPage
      code="500"
      title="Terjadi kesalahan"
      description="Nexora mengalami kesalahan yang tidak terduga. Silakan coba kembali."
      onRetry={reset}
    />
  );
}
