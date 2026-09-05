"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DataTableTransition } from "@/components/data-table/data-table.types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { deleteRoleAction } from "../roles.actions";

interface DeleteRoleButtonProps {
  id: string;
  name: string;
  code: string;
  isPending: boolean;
  startTransition: DataTableTransition;
}

export function DeleteRoleButton({
  id,
  name,
  code,
  isPending,
  startTransition,
}: DeleteRoleButtonProps) {
  const router = useRouter();

  const { toast } = useToast();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRoleAction(id);

      if (!result.success) {
        toast({
          title: "Unable to delete role",

          description: result.message,

          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Role deleted",

        description: `${name} has been removed.`,

        variant: "success",
      });

      router.refresh();
    });
  }

  return (
    <ConfirmDialog
      title="Delete role"
      description="This action cannot be undone."
      entity={{
        primary: name,
        secondary: code,
      }}
      message="Are you sure you want to permanently delete this role?"
      confirmLabel="Delete role"
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
