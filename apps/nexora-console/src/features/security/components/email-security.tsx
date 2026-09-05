"use client";

import { useState, useTransition } from "react";
import { Mail, RefreshCw, ShieldCheck, X } from "lucide-react";
import type { AccountEmailSecurity } from "@nexora/contracts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Typography } from "@/components/ui/typography";
import { useToast } from "@/hooks/use-toast";

import {
  cancelEmailChangeAction,
  requestEmailChangeAction,
  resendEmailChangeAction,
} from "../email-security.actions";

interface EmailSecurityProps {
  initialData: AccountEmailSecurity;
}

export function EmailSecurity({ initialData }: EmailSecurityProps) {
  const { toast } = useToast();
  const [data, setData] = useState<AccountEmailSecurity>(initialData);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleRequest = () => {
    startTransition(async () => {
      const result = await requestEmailChangeAction({
        newEmail,
        currentPassword,
      });

      if (!result.success) {
        toast({
          title: "Change Email Failed",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      if (!result.pendingEmail || !result.expiresAt) {
        toast({
          title: "Change Email Failed",
          description: "Server tidak mengembalikan pending email yang valid.",
          variant: "destructive",
        });
        return;
      }

      setData((current) => ({
        ...current,
        pendingChange: {
          pendingEmail: result.pendingEmail!,
          expiresAt: result.expiresAt!,
        },
      }));

      setNewEmail("");
      setCurrentPassword("");

      toast({
        title: "Verification Email Sent",
        description:
          "Silakan periksa email baru Anda untuk menyelesaikan perubahan.",
        variant: "success",
      });
    });
  };

  const handleResend = () => {
    startTransition(async () => {
      const result = await resendEmailChangeAction();

      if (!result.success) {
        toast({
          title: "Resend Failed",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      if (result.pendingEmail && result.expiresAt) {
        setData((current) => ({
          ...current,
          pendingChange: {
            pendingEmail: result.pendingEmail!,
            expiresAt: result.expiresAt!,
          },
        }));
      }

      toast({
        title: "Verification Email Resent",
        description: "Link verifikasi baru telah dikirim.",
        variant: "success",
      });
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelEmailChangeAction();

      if (!result.success) {
        toast({
          title: "Cancel Failed",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      setData((current) => ({
        ...current,
        pendingChange: null,
      }));

      toast({
        title: "Email Change Cancelled",
        description: "Permintaan perubahan email telah dibatalkan.",
        variant: "success",
      });
    });
  };

  const requestDisabled = isPending || !newEmail.trim() || !currentPassword;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
          <Mail className="size-5" />
        </div>

        <div>
          <Typography variant="h3">Email Security</Typography>

          <Typography variant="muted" className="mt-1">
            Manage the email address used to sign in to your Nexora account.
          </Typography>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Typography variant="h4">Current Email</Typography>

            <Typography variant="body" className="mt-1 break-all">
              {data.email}
            </Typography>
          </div>

          {data.emailVerified ? (
            <Badge variant="secondary">Verified</Badge>
          ) : (
            <Badge variant="outline">Unverified</Badge>
          )}
        </div>
      </div>

      {data.pendingChange ? (
        <div className="mt-6 rounded-lg border bg-muted/20 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" />

                <Typography variant="h4">Pending Email</Typography>
              </div>

              <Typography variant="body" className="mt-2 break-all font-medium">
                {data.pendingChange.pendingEmail}
              </Typography>

              <Typography variant="muted" className="mt-1">
                A verification link has been sent to this address.
              </Typography>
            </div>

            <Badge variant="outline">Pending</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ConfirmDialog
              trigger={
                <Button type="button" variant="outline" disabled={isPending}>
                  <RefreshCw className="size-4" />
                  Resend Verification
                </Button>
              }
              title="Resend Verification Email"
              message="A new verification link will be sent and the previous link will become invalid."
              entity={{
                primary: data.pendingChange.pendingEmail,
              }}
              confirmLabel="Resend"
              loadingLabel="Sending..."
              loading={isPending}
              onConfirm={handleResend}
            />

            <ConfirmDialog
              trigger={
                <Button type="button" variant="outline" disabled={isPending}>
                  <X className="size-4" />
                  Cancel Change
                </Button>
              }
              title="Cancel Email Change"
              message="This pending email change will be cancelled and its verification link will no longer be valid."
              entity={{
                primary: data.pendingChange.pendingEmail,
              }}
              confirmLabel="Cancel Change"
              loadingLabel="Cancelling..."
              loading={isPending}
              destructive
              onConfirm={handleCancel}
            />
          </div>
        </div>
      ) : (
        <div className="mt-6 border-t pt-6">
          <Typography variant="h4">Change Email</Typography>

          <Typography variant="muted" className="mt-1">
            Your current email remains active until the new email is verified.
          </Typography>

          <div className="mt-5 space-y-4">
            <FormField label="New Email" htmlFor="new-email">
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                value={newEmail}
                disabled={isPending}
                placeholder="name@example.com"
                onChange={(event) => setNewEmail(event.target.value)}
              />
            </FormField>

            <FormField
              label="Current Password"
              htmlFor="current-password-email-change"
            >
              <PasswordInput
                id="current-password-email-change"
                autoComplete="current-password"
                value={currentPassword}
                disabled={isPending}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </FormField>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={requestDisabled}
                onClick={handleRequest}
              >
                {isPending ? "Sending..." : "Change Email"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
