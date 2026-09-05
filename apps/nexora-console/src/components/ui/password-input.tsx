"use client";

import { useState, type InputHTMLAttributes } from "react";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <LockKeyhole
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
      />

      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        className={cn(
          "h-12 rounded-xl border-border/80 bg-secondary/35 pl-10 pr-11 text-sm shadow-none transition-all placeholder:text-muted-foreground focus-visible:border-brand-400 focus-visible:ring-brand-400/20",
          className,
        )}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
