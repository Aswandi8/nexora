"use client";

import {
  updateAccountProfileSchema,
  type AdminSession,
} from "@nexora/contracts";

import { CheckCircle2, Mail, ShieldCheck, UserRound } from "lucide-react";

import { useState, useTransition, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SemanticBadge } from "@/components/ui/semantic-badge";
import { Typography } from "@/components/ui/typography";

import {
  getRoleBadgeType,
  getUserStatusBadgeType,
} from "@/config/badge.config";

import { useToast } from "@/hooks/use-toast";

import { updateProfileAction } from "../profile.actions";

interface ProfileFormProps {
  session: AdminSession;
}

export function ProfileForm({ session }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [currentName, setCurrentName] = useState(session.user.name);

  const [name, setName] = useState(session.user.name);

  const [nameError, setNameError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const initial =
    currentName.trim().charAt(0).toUpperCase() ||
    session.user.email.charAt(0).toUpperCase();

  const hasChanges = name.trim() !== currentName;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const parsed = updateAccountProfileSchema.safeParse({
      name,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues.find((item) => item.path[0] === "name");

      setNameError(issue?.message ?? "Nama yang dimasukkan tidak valid.");

      return;
    }

    if (parsed.data.name === currentName) {
      setName(parsed.data.name);
      setNameError(null);

      return;
    }

    setNameError(null);

    startTransition(async () => {
      const result = await updateProfileAction(parsed.data);

      if (!result.success) {
        const fieldError = result.fields?.name?.[0];

        if (fieldError) {
          setNameError(fieldError);
        }

        toast({
          title: "Profil gagal diperbarui",
          description: result.message ?? "Profil tidak dapat diperbarui.",
          variant: "destructive",
        });

        return;
      }

      const updatedName = result.name ?? parsed.data.name;

      setCurrentName(updatedName);
      setName(updatedName);

      toast({
        title: "Profil diperbarui",
        description: "Nama akun Anda berhasil disimpan.",
        variant: "success",
      });

      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 border-b border-border bg-secondary/20 px-5 py-6 sm:flex-row sm:items-center sm:px-6">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-xl font-semibold text-brand-700 dark:text-brand-300">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <Typography as="h2" variant="h3">
              {currentName}
            </Typography>

            <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Mail aria-hidden="true" className="size-4 shrink-0" />

              <span className="truncate">{session.user.email}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <SemanticBadge
                type={
                  session.user.emailVerified
                    ? "verification.verified"
                    : "verification.unverified"
                }
                icon={
                  session.user.emailVerified ? (
                    <CheckCircle2 aria-hidden="true" className="size-3" />
                  ) : undefined
                }
              />

              <SemanticBadge
                type={getUserStatusBadgeType(session.user.status)}
              />

              {session.user.role ? (
                <SemanticBadge
                  type={getRoleBadgeType(session.user.role.code)}
                  label={session.user.role.name}
                />
              ) : (
                <SemanticBadge type="generic.disabled" label="No Role" />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-3">
          <div className="bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <UserRound
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />

              <Typography variant="eyebrow">Status</Typography>
            </div>

            <div className="mt-3">
              <SemanticBadge
                type={getUserStatusBadgeType(session.user.status)}
              />
            </div>
          </div>

          <div className="bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />

              <Typography variant="eyebrow">Role</Typography>
            </div>

            <div className="mt-3">
              {session.user.role ? (
                <SemanticBadge
                  type={getRoleBadgeType(session.user.role.code)}
                  label={session.user.role.name}
                />
              ) : (
                <SemanticBadge type="generic.disabled" label="No Role" />
              )}
            </div>
          </div>

          <div className="bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Mail
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />

              <Typography variant="eyebrow">Email</Typography>
            </div>

            <div className="mt-3">
              <SemanticBadge
                type={
                  session.user.emailVerified
                    ? "verification.verified"
                    : "verification.unverified"
                }
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-6">
          <Typography as="h2" variant="h3">
            Personal Information
          </Typography>

          <Typography variant="muted" className="mt-1 max-w-2xl">
            Manage the personal information displayed throughout Nexora Console.
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Name"
            htmlFor="profile-name"
            description="Your name is displayed throughout Nexora Console."
            error={nameError}
          >
            <Input
              id="profile-name"
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                if (nameError) {
                  setNameError(null);
                }
              }}
              autoComplete="name"
              disabled={isPending}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="profile-email"
            description="Email changes are managed securely from the Security page."
          >
            <Input
              id="profile-email"
              type="email"
              value={session.user.email}
              disabled
              readOnly
            />
          </FormField>

          <div className="flex justify-end border-t border-border pt-5">
            <Button type="submit" disabled={isPending || !hasChanges}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
