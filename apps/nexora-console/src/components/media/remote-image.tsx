"use client";

import Image from "next/image";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type NextImageProps = ComponentProps<typeof Image>;

interface RemoteImageProps extends Omit<
  NextImageProps,
  "src" | "alt" | "fill" | "unoptimized"
> {
  src: string;
  alt: string;
  className?: string;
}

export function RemoteImage({
  src,
  alt,
  className,
  sizes = "100vw",
  ...props
}: RemoteImageProps) {
  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized
      className={cn("object-cover", className)}
    />
  );
}
