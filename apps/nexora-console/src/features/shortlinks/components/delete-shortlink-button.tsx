"use client";

import { Trash2 } from "lucide-react";

import { useRouter } from "next/navigation";

import type { DataTableTransition } from "@/components/data-table/data-table.types";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";

import { deleteShortlinkAction } from "../shortlinks.actions";

interface DeleteShortlinkButtonProps {
  id: string;
  title: string;
  slug: string;
  isPending: boolean;
  startTransition: DataTableTransition;
}

export function DeleteShortlinkButton({
  id,
  title,
  slug,
  isPending,
  startTransition,
}: DeleteShortlinkButtonProps) {
  const router = useRouter();

  const { toast } = useToast();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteShortlinkAction(id);

      if (!result.success) {
        toast({
          title: "Unable to delete shortlink",
          description: result.message,
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Shortlink deleted",
        description: `${title} has been removed.`,
        variant: "success",
      });

      router.refresh();
    });
  }

  return (
    <ConfirmDialog
      title="Delete shortlink"
      description="This action cannot be undone."
      entity={{
        primary: title,
        secondary: `/${slug}`,
      }}
      message="Are you sure you want to permanently delete this shortlink?"
      confirmLabel="Delete shortlink"
      destructive
      loading={isPending}
      onConfirm={handleDelete}
      trigger={
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onSelect={(event) => event.preventDefault()}
        >
          <Trash2 className="size-4" />

          <span>Delete</span>
        </DropdownMenuItem>
      }
    />
  );
}
