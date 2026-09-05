"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowLeft, Home } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

import { Typography } from "@/components/ui/typography";

import { cn } from "@/lib/utils";

type ErrorCode = "401" | "403" | "404" | "500";

interface ErrorPageProps {
  code: ErrorCode;
  title: string;
  description: string;
  imageSrc?: string;
  showBackButton?: boolean;
  homeHref?: string;
  onRetry?: () => void;
}

const errorImages: Record<ErrorCode, string> = {
  "401": "/images/errors/401.png",
  "403": "/images/errors/403.png",
  "404": "/images/errors/404.png",
  "500": "/images/errors/500.png",
};

export function ErrorPage({
  code,
  title,
  description,
  imageSrc,
  showBackButton = true,
  homeHref = "/dashboard",
  onRetry,
}: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="mx-auto grid w-full max-w-xl justify-items-center gap-6 text-center">
        <Image
          src={imageSrc ?? errorImages[code]}
          alt={`${code} ${title}`}
          width={420}
          height={320}
          className="h-auto max-h-80 w-auto max-w-full object-contain"
          priority
        />

        <div className="grid gap-2">
          <Typography
            variant="eyebrow"
            className="text-brand-600 dark:text-brand-300"
          >
            Error {code}
          </Typography>

          <Typography as="h1" variant="h1">
            {title}
          </Typography>

          <Typography variant="muted" className="mx-auto max-w-md">
            {description}
          </Typography>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {showBackButton ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => history.back()}
            >
              <ArrowLeft className="size-4" />
              Go back
            </Button>
          ) : null}

          {onRetry ? (
            <Button type="button" onClick={onRetry}>
              Try again
            </Button>
          ) : (
            <Link href={homeHref} className={cn(buttonVariants())}>
              <Home className="size-4" />
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
