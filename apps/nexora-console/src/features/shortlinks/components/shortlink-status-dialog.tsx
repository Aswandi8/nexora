"use client";

import type { Shortlink } from "@nexora/contracts";
import { useState } from "react";

import {
  SelectionDialog,
  type SelectionDialogOption,
} from "@/components/ui/selection-dialog";
import { SemanticBadge } from "@/components/ui/semantic-badge";
import { getShortlinkStatusBadgeType } from "@/config/badge.config";
import { useToast } from "@/hooks/use-toast";

import { updateShortlinkStatusAction } from "../shortlinks.actions";

type ShortlinkStatus = Shortlink["status"];
type StartTransition = (action: () => void | Promise<void>) => void;

interface ShortlinkStatusDialogProps {
  shortlink: Shortlink;
  open: boolean;
  pending: boolean;
  startTransition: StartTransition;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: SelectionDialogOption<ShortlinkStatus>[] = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Shortlink aktif dan dapat diakses melalui public URL.",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    description: "Shortlink dinonaktifkan dan tidak dapat digunakan.",
  },
];

export function ShortlinkStatusDialog({
  shortlink,
  open,
  pending,
  startTransition,
  onOpenChange,
}: ShortlinkStatusDialogProps) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<ShortlinkStatus>(
    shortlink.status,
  );

  function handleSubmit(status: ShortlinkStatus) {
    startTransition(async () => {
      const result = await updateShortlinkStatusAction(shortlink.id, status);

      if (!result.success) {
        toast({
          title: "Status update failed",
          description:
            result.message ?? "Unable to update the shortlink status.",
          variant: "destructive",
        });

        return;
      }

      setCurrentStatus(status);
      onOpenChange(false);

      toast({
        title: "Status updated",
        description: `${shortlink.title}'s status has been updated.`,
        variant: "success",
      });
    });
  }

  return (
    <SelectionDialog
      open={open}
      title="Ubah Status"
      description="Atur status shortlink tanpa membuka halaman edit."
      fieldLabel="Status baru"
      value={currentStatus}
      options={STATUS_OPTIONS}
      subjectName={shortlink.title}
      subjectDescription={`/${shortlink.slug}`}
      currentValue={
        <SemanticBadge type={getShortlinkStatusBadgeType(currentStatus)} />
      }
      information={
        <>
          Shortlink <strong>Inactive</strong> tidak dapat digunakan melalui
          public URL sampai statusnya diaktifkan kembali.
        </>
      }
      pending={pending}
      renderValue={(option) => (
        <SemanticBadge
          type={getShortlinkStatusBadgeType(option.value)}
          label={option.label}
        />
      )}
      renderOption={(option) => (
        <div className="flex min-w-0 items-center gap-3">
          <SemanticBadge
            type={getShortlinkStatusBadgeType(option.value)}
            label={option.label}
            className="shrink-0"
          />

          <span className="truncate text-xs text-muted-foreground">
            {option.description}
          </span>
        </div>
      )}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
}
