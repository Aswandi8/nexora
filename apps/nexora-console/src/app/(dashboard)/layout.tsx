import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireAdminSession } from "@/features/auth/auth.server";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await requireAdminSession();

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
