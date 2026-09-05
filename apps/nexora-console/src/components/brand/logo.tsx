import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  variant?: "logo" | "brand";
}

const LOGO_SOURCE = {
  logo: "/images/brand/logo1.png",
  brand: "/images/brand/brand.png",
} as const;

export function Logo({
  className,
  priority = false,
  width = 140,
  height = 40,
  variant = "logo",
}: LogoProps) {
  return (
    <Image
      src={LOGO_SOURCE[variant]}
      alt="Nexora"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
