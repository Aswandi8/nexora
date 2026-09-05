"use client";

import { changeAccountPasswordSchema } from "@nexora/contracts";

import { Eye, EyeOff, KeyRound } from "lucide-react";

import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

import { useToast } from "@/hooks/use-toast";

import { changePasswordAction } from "../security.actions";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

type PasswordErrors = Partial<Record<PasswordField, string>>;

export function ChangePasswordForm() {
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<PasswordErrors>({});

  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isPending, startTransition] = useTransition();

  function toggleVisibility(field: PasswordField) {
    setVisible((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  function clearFieldError(field: PasswordField) {
    if (!errors[field]) {
      return;
    }

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const parsed = changeAccountPasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const nextErrors: PasswordErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as PasswordField;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);

      return;
    }

    setErrors({});

    startTransition(async () => {
      const result = await changePasswordAction(parsed.data);

      if (!result.success) {
        const fieldErrors = result.fields ?? {};

        setErrors({
          currentPassword: fieldErrors.currentPassword?.[0],
          newPassword: fieldErrors.newPassword?.[0],
          confirmPassword: fieldErrors.confirmPassword?.[0],
        });

        toast({
          title: "Password gagal diubah",
          description: result.message ?? "Password tidak dapat diubah.",
          variant: "destructive",
        });

        return;
      }

      resetForm();

      toast({
        title: "Password diperbarui",
        description:
          "Password berhasil diubah dan session lain telah dikeluarkan.",
        variant: "success",
      });
    });
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <KeyRound aria-hidden="true" className="size-5" />
        </div>

        <div>
          <Typography as="h2" variant="h3">
            Change Password
          </Typography>

          <Typography variant="muted" className="mt-1">
            Use a strong password that you do not use for other services.
          </Typography>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          id="current-password"
          label="Current Password"
          value={currentPassword}
          visible={visible.currentPassword}
          error={errors.currentPassword}
          disabled={isPending}
          autoComplete="current-password"
          onChange={(value) => {
            setCurrentPassword(value);
            clearFieldError("currentPassword");
          }}
          onToggle={() => toggleVisibility("currentPassword")}
        />

        <PasswordInput
          id="new-password"
          label="New Password"
          value={newPassword}
          visible={visible.newPassword}
          error={errors.newPassword}
          disabled={isPending}
          autoComplete="new-password"
          description="Use 8 to 128 characters."
          onChange={(value) => {
            setNewPassword(value);
            clearFieldError("newPassword");
          }}
          onToggle={() => toggleVisibility("newPassword")}
        />

        <PasswordInput
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          visible={visible.confirmPassword}
          error={errors.confirmPassword}
          disabled={isPending}
          autoComplete="new-password"
          onChange={(value) => {
            setConfirmPassword(value);
            clearFieldError("confirmPassword");
          }}
          onToggle={() => toggleVisibility("confirmPassword")}
        />

        <div className="flex justify-end border-t border-border pt-5">
          <Button
            type="submit"
            disabled={
              isPending || !currentPassword || !newPassword || !confirmPassword
            }
          >
            {isPending ? "Changing Password..." : "Change Password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  error?: string;
  description?: string;
  disabled?: boolean;
  autoComplete: "current-password" | "new-password";
  onChange(value: string): void;
  onToggle(): void;
}

function PasswordInput({
  id,
  label,
  value,
  visible,
  error,
  description,
  disabled,
  autoComplete,
  onChange,
  onToggle,
}: PasswordInputProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      description={description}
      error={error}
    >
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          className="pr-10"
        />

        <button
          type="button"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          onClick={onToggle}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
    </FormField>
  );
}
