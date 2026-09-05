"use client";

import { useEffect } from "react";

import { ErrorPage } from "@/components/feedback/error-page";

interface ErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      code="500"
      title="Something went wrong"
      description="Nexora encountered an unexpected error. Please try again."
      onRetry={reset}
    />
  );
}
