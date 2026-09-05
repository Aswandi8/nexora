"use client";

import { Send } from "lucide-react";

import type { DataTableTransition } from "@/components/data-table/data-table.types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

import { resendUserInvitationAction } from "../users.actions";

interface ResendInvitationButtonProps {
  id: string;
  name: string;
  email: string;
  isPending: boolean;
  startTransition: DataTableTransition;
}

export function ResendInvitationButton({
  id,
  name,
  email,
  isPending,
  startTransition,
}: ResendInvitationButtonProps) {
  const { toast } = useToast();

  function handleResend() {
    startTransition(async () => {
      const result = await resendUserInvitationAction(id);

      if (!result.success) {
        toast({
          title: "Unable to send invitation",
          description: result.message,
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Invitation sent",
        description: `A new invitation has been sent to ${email}.`,
        variant: "success",
      });
    });
  }

  return (
    <ConfirmDialog
      title="Resend invitation"
      description="Nexora will send a new account invitation."
      entity={{
        primary: name,
        secondary: email,
      }}
      message="Send a new invitation to this user?"
      confirmLabel="Send invitation"
      loading={isPending}
      onConfirm={handleResend}
      trigger={
        <DropdownMenuItem
          disabled={isPending}
          onSelect={(event) => event.preventDefault()}
        >
          <Send className="size-4" />

          <span>Resend invitation</span>
        </DropdownMenuItem>
      }
    />
  );
}
