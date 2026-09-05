"use client";

import { Trash2 } from "lucide-react";

import { useRouter } from "next/navigation";

import type { DataTableTransition } from "@/components/data-table/data-table.types";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";

import { deleteUserAction } from "../users.actions";

interface DeleteUserButtonProps {
  id: string;
  name: string;
  email: string;
  isPending: boolean;
  startTransition: DataTableTransition;
}

export function DeleteUserButton({
  id,
  name,
  email,
  isPending,
  startTransition,
}: DeleteUserButtonProps) {
  const router = useRouter();

  const { toast } = useToast();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUserAction(id);

      if (!result.success) {
        toast({
          title: "Unable to delete user",

          description: result.message,

          variant: "destructive",
        });

        return;
      }

      toast({
        title: "User deleted",

        description: `${name} has been removed.`,

        variant: "success",
      });

      router.refresh();
    });
  }

  return (
    <ConfirmDialog
      title="Delete user"
      description="This action cannot be undone."
      entity={{
        primary: name,
        secondary: email,
      }}
      message="Are you sure you want to permanently delete this user account?"
      confirmLabel="Delete user"
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
