"use client";

import { useEffect } from "react";

import { ErrorPage } from "@/components/feedback/error-page";

interface GlobalErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <ErrorPage
          code="500"
          title="Nexora is unavailable"
          description="A critical error occurred while loading the console."
          showBackButton={false}
          homeHref="/"
          onRetry={reset}
        />
      </body>
    </html>
  );
}
