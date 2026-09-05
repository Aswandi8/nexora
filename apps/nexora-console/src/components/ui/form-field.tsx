import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string | null;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  description,
  error,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Label htmlFor={htmlFor}>{label}</Label>

      {children}

      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
