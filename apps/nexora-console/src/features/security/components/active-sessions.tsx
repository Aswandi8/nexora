"use client";

import type { AccountSession } from "@nexora/contracts";

import {
  Clock3,
  Laptop,
  LogOut,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { Typography } from "@/components/ui/typography";

import { useToast } from "@/hooks/use-toast";

import {
  logoutAllSessionsAction,
  logoutOtherSessionsAction,
  revokeSessionAction,
} from "../session.actions";

interface ActiveSessionsProps {
  initialSessions: AccountSession[];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") {
    return <Smartphone className="size-5" />;
  }

  if (device === "Tablet") {
    return <Tablet className="size-5" />;
  }

  if (device === "Desktop") {
    return <Monitor className="size-5" />;
  }

  return <Laptop className="size-5" />;
}

export function ActiveSessions({ initialSessions }: ActiveSessionsProps) {
  const router = useRouter();

  const { toast } = useToast();

  const [sessions, setSessions] = useState(initialSessions);

  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const currentSession = sessions.find((session) => session.current);

  const otherSessions = sessions.filter((session) => !session.current);

  function handleRevoke(sessionId: string) {
    if (isPending) {
      return;
    }

    setPendingSessionId(sessionId);

    startTransition(async () => {
      const result = await revokeSessionAction(sessionId);

      if (!result.success) {
        setPendingSessionId(null);

        toast({
          title: "Session gagal dikeluarkan",
          description: result.message ?? "Session tidak dapat dikeluarkan.",
          variant: "destructive",
        });

        return;
      }

      setSessions((current) =>
        current.filter((session) => session.id !== sessionId),
      );

      setPendingSessionId(null);

      toast({
        title: "Session dikeluarkan",
        description: "Perangkat tersebut tidak lagi memiliki session aktif.",
        variant: "success",
      });

      router.refresh();
    });
  }

  function handleLogoutOthers() {
    if (isPending || otherSessions.length === 0) {
      return;
    }

    setPendingSessionId("__others__");

    startTransition(async () => {
      const result = await logoutOtherSessionsAction();

      if (!result.success) {
        setPendingSessionId(null);

        toast({
          title: "Session gagal dikeluarkan",
          description:
            result.message ?? "Session lain tidak dapat dikeluarkan.",
          variant: "destructive",
        });

        return;
      }

      setSessions((current) => current.filter((session) => session.current));

      setPendingSessionId(null);

      toast({
        title: "Session lain dikeluarkan",
        description: result.revokedCount
          ? `${result.revokedCount} session berhasil dikeluarkan.`
          : "Tidak ada session lain yang aktif.",
        variant: "success",
      });

      router.refresh();
    });
  }

  function handleLogoutAll() {
    if (isPending || sessions.length === 0) {
      return;
    }

    setPendingSessionId("__all__");

    startTransition(async () => {
      const result = await logoutAllSessionsAction();

      if (!result.success) {
        setPendingSessionId(null);

        toast({
          title: "Logout gagal",
          description:
            result.message ?? "Semua session tidak dapat dikeluarkan.",
          variant: "destructive",
        });

        return;
      }

      setSessions([]);

      router.replace("/login");

      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Typography as="h2" variant="h3">
            Active Sessions
          </Typography>

          <Typography variant="muted" className="mt-1">
            Review devices currently signed in to your Nexora account.
          </Typography>
        </div>

        <ConfirmDialog
          trigger={
            <Button
              type="button"
              variant="outline"
              disabled={isPending || otherSessions.length === 0}
            >
              <LogOut className="size-4" />

              {pendingSessionId === "__others__"
                ? "Logging Out..."
                : "Logout Other Sessions"}
            </Button>
          }
          title="Logout Other Sessions"
          description="Sign out from all other devices."
          message={
            otherSessions.length === 1
              ? "This will revoke 1 other active session. Your current session will remain active."
              : `This will revoke ${otherSessions.length} other active sessions. Your current session will remain active.`
          }
          entity={{
            primary: `${otherSessions.length} other ${
              otherSessions.length === 1 ? "session" : "sessions"
            }`,
            secondary: "This device will remain signed in",
          }}
          confirmLabel="Logout Other Sessions"
          loadingLabel="Logging Out..."
          loading={pendingSessionId === "__others__" && isPending}
          destructive
          onConfirm={handleLogoutOthers}
        />
      </div>

      <div className="divide-y divide-border">
        {currentSession && <SessionRow session={currentSession} />}

        {otherSessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            pending={pendingSessionId === session.id}
            onRevoke={() => handleRevoke(session.id)}
          />
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="px-5 py-10 text-center sm:px-6">
          <Typography variant="muted">No active sessions found.</Typography>
        </div>
      )}

      <div className="border-t border-border px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography as="h3" variant="h4">
              Logout All Sessions
            </Typography>

            <Typography variant="muted" className="mt-1">
              Sign out from every device, including this device.
            </Typography>
          </div>

          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="destructive"
                disabled={isPending || sessions.length === 0}
              >
                <LogOut className="size-4" />

                {pendingSessionId === "__all__"
                  ? "Logging Out..."
                  : "Logout All Sessions"}
              </Button>
            }
            title="Logout All Sessions"
            description="Sign out from every device."
            message="This will revoke every active session associated with your account, including the session on this device. You will need to sign in again."
            entity={{
              primary: `${sessions.length} active ${
                sessions.length === 1 ? "session" : "sessions"
              }`,
              secondary: "This device will also be signed out",
            }}
            confirmLabel="Logout All Sessions"
            loadingLabel="Logging Out..."
            loading={pendingSessionId === "__all__" && isPending}
            destructive
            onConfirm={handleLogoutAll}
          />
        </div>
      </div>
    </Card>
  );
}

interface SessionRowProps {
  session: AccountSession;
  pending?: boolean;
  onRevoke?: () => void;
}

function SessionRow({ session, pending = false, onRevoke }: SessionRowProps) {
  const isPending = pending;

  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <DeviceIcon device={session.device} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Typography variant="body" className="font-medium">
              {session.browser} on {session.operatingSystem}
            </Typography>

            {session.current && (
              <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300">
                This device
              </span>
            )}
          </div>

          <Typography variant="muted" className="mt-1">
            {session.device}

            {session.ipAddress ? ` • ${session.ipAddress}` : ""}
          </Typography>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3.5" />
              Last active {formatDate(session.lastActiveAt)}
            </span>

            <span>Expires {formatDate(session.expiresAt)}</span>
          </div>
        </div>
      </div>

      {!session.current && onRevoke && (
        <ConfirmDialog
          trigger={
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="shrink-0"
            >
              <LogOut className="size-4" />

              {isPending ? "Revoking..." : "Revoke"}
            </Button>
          }
          title="Revoke Session"
          description="Sign out this device from your account."
          message="This session will be revoked immediately. The device will need to sign in again before accessing Nexora."
          entity={{
            primary: `${session.browser} on ${session.operatingSystem}`,
            secondary: `${session.device}${
              session.ipAddress ? ` • ${session.ipAddress}` : ""
            }`,
          }}
          confirmLabel="Revoke Session"
          loadingLabel="Revoking..."
          loading={isPending}
          destructive
          onConfirm={onRevoke}
        />
      )}
    </div>
  );
}
