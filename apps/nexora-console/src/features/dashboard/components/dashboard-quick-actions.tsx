import { PERMISSIONS, type PermissionCode } from "@nexora/contracts";

import { Link2, ShieldCheck, Users } from "lucide-react";

import { Typography } from "@/components/ui/typography";

import { QuickActionCard } from "./quick-action-card";

interface DashboardQuickActionsProps {
  permissions: PermissionCode[];
}

export function DashboardQuickActions({
  permissions,
}: DashboardQuickActionsProps) {
  const canReadShortlinks = permissions.includes(PERMISSIONS.SHORTLINKS_READ);

  const canReadUsers = permissions.includes(PERMISSIONS.USERS_READ);

  const canReadRoles = permissions.includes(PERMISSIONS.ROLES_READ);

  if (!canReadShortlinks && !canReadUsers && !canReadRoles) {
    return null;
  }

  return (
    <section
      aria-labelledby="dashboard-quick-actions-title"
      className="flex h-full flex-col space-y-4"
    >
      <div>
        <Typography as="h2" id="dashboard-quick-actions-title" variant="h3">
          Quick Actions
        </Typography>

        <Typography variant="muted" className="mt-1">
          Quickly access frequently managed resources.
        </Typography>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3">
        {canReadShortlinks ? (
          <QuickActionCard
            title="Manage Shortlinks"
            description="View and manage shortlinks"
            href="/shortlinks"
            icon={Link2}
          />
        ) : null}

        {canReadUsers ? (
          <QuickActionCard
            title="Manage Users"
            description="Manage workspace users"
            href="/users"
            icon={Users}
          />
        ) : null}

        {canReadRoles ? (
          <QuickActionCard
            title="Manage Roles"
            description="Configure roles and access"
            href="/roles"
            icon={ShieldCheck}
          />
        ) : null}
      </div>
    </section>
  );
}
