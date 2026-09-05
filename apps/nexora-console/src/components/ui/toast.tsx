"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "destructive";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  icon?: ReactNode;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const DefaultIcon =
    toast.variant === "success"
      ? CheckCircle2
      : toast.variant === "destructive"
        ? AlertCircle
        : Info;

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full gap-3 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg",
        toast.variant === "success" && "border-success/30",
        toast.variant === "destructive" && "border-destructive/30",
      )}
      role="status"
    >
      <div
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center",
          toast.variant === "success" && "text-success",
          toast.variant === "destructive" && "text-destructive",
          (!toast.variant || toast.variant === "default") &&
            "text-muted-foreground",
          "[&_svg]:size-4",
        )}
      >
        {toast.icon ?? <DefaultIcon className="size-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{toast.title}</p>

        {toast.description ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {toast.description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
