"use client";

import { ErrorPage } from "@/components/feedback/error-page";

interface GlobalErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="id">
      <body>
        <ErrorPage
          code="500"
          title="Nexora tidak tersedia"
          description="Terjadi kesalahan kritis saat memuat Nexora Console."
          showBackButton={false}
          homeHref="/"
          onRetry={reset}
        />
      </body>
    </html>
  );
}
