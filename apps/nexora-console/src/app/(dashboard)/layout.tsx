import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireAdminSession } from "@/features/auth/auth.server";
import { IdleSessionGuard } from "@/features/security/components/idle-session-guard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await requireAdminSession();

  return (
    <>
      <IdleSessionGuard />{" "}
      <DashboardShell session={session}>{children}</DashboardShell>
    </>
  );
}
