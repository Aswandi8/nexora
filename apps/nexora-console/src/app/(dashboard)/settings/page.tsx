import type { Metadata } from "next";

import {
  Clock3,
  Globe2,
  Link2,
  Mail,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { PageHeaderCard } from "@/components/layout/page-header-card";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { requireAdminSession } from "@/features/auth/auth.server";

export const metadata: Metadata = {
  title: "Settings",
};

interface SettingRowProps {
  label: string;
  value: string;
}

function SettingRow({ label, value }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <Typography variant="body-sm" className="font-medium">
        {label}
      </Typography>
      <Typography variant="muted" className="sm:text-right">
        {value}
      </Typography>
    </div>
  );
}

interface SettingSectionProps {
  icon: typeof Settings2;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingSection({
  icon: Icon,
  title,
  description,
  children,
}: SettingSectionProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border px-5 py-5 sm:px-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Icon aria-hidden="true" className="size-4.5" />
        </div>
        <div>
          <Typography as="h2" variant="h4">
            {title}
          </Typography>
          <Typography variant="muted" className="mt-1">
            {description}
          </Typography>
        </div>
      </div>
      <div className="px-5 sm:px-6">{children}</div>
    </Card>
  );
}

export default async function SettingsPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      <PageHeaderCard
        breadcrumbs={[
          {
            label: "Configuration",
          },
          {
            label: "Settings",
          },
        ]}
        title="Settings"
        description="Review the default configuration used across Nexora."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingSection
          icon={Settings2}
          title="General"
          description="Basic application defaults."
        >
          <SettingRow label="Application Name" value="Nexora" />
          <SettingRow label="Application URL" value="Not configured" />
          <SettingRow label="Timezone" value="System default" />
          <SettingRow label="Default Language" value="English" />
        </SettingSection>

        <SettingSection
          icon={Link2}
          title="Shortlink"
          description="Default behavior for shortlink resources."
        >
          <SettingRow label="Default behavior" value="Standard" />
          <SettingRow label="Default domain" value="Application default" />
          <SettingRow label="Default expiration policy" value="No expiration" />
        </SettingSection>

        <SettingSection
          icon={ShieldCheck}
          title="Security Policy"
          description="Default account and session security policy."
        >
          <SettingRow label="Session lifetime" value="Authentication default" />
          <SettingRow label="Idle timeout" value="30 minutes" />
          <SettingRow label="Password policy" value="Minimum 8 characters" />
        </SettingSection>

        <SettingSection
          icon={Mail}
          title="Email"
          description="Default email and invitation configuration."
        >
          <SettingRow label="Sender Name" value="Nexora" />
          <SettingRow label="Sender Address" value="Environment configured" />
          <SettingRow label="Invitation settings" value="Enabled" />
        </SettingSection>

        <SettingSection
          icon={Wrench}
          title="System"
          description="Operational state of the Nexora Console."
        >
          <SettingRow label="Maintenance Mode" value="Off" />
        </SettingSection>

        <Card className="flex min-h-40 items-center p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Globe2 aria-hidden="true" className="size-4.5" />
            </div>
            <div>
              <Typography as="h2" variant="h4">
                Configuration
              </Typography>
              <Typography variant="muted" className="mt-1 max-w-md">
                These values are currently informational defaults. Editable
                system configuration can be introduced when Nexora requires
                runtime-managed settings.
              </Typography>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-3.5" />
                No database settings are changed from this page.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
