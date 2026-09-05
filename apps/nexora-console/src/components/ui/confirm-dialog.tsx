"use client";

import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

interface ConfirmDialogEntity {
  primary: string;
  secondary?: string;
}

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  message: string;
  entity?: ConfirmDialogEntity;
  confirmLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  message,
  entity,
  confirmLabel = "Confirm",
  loadingLabel = "Deleting...",
  cancelLabel = "Cancel",
  loading = false,
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-w-lg overflow-hidden p-0">
        <div className="border-b border-border px-6 py-5">
          <AlertDialogTitle className="text-base font-semibold text-foreground">
            {title}
          </AlertDialogTitle>

          {description ? (
            <AlertDialogDescription className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </AlertDialogDescription>
          ) : null}
        </div>

        <div className="space-y-5 px-6 py-5">
          {entity ? (
            <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3.5">
              <p className="text-sm font-medium text-foreground">
                {entity.primary}
              </p>

              {entity.secondary ? (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {entity.secondary}
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-secondary/20 px-6 py-4 sm:flex-row sm:justify-end">
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" disabled={loading}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              type="button"
              variant={destructive ? "destructive" : "default"}
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? loadingLabel : confirmLabel}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
