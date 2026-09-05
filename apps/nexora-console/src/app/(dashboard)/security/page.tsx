import {
  accountSessionListSchema,
  type AccountSessionList,
} from "@nexora/contracts";

import { PageHeaderCard } from "@/components/layout/page-header-card";
import { ActiveSessions } from "@/features/security/components/active-sessions";
import { ChangePasswordForm } from "@/features/security/components/change-password-form";
import { EmailSecurity } from "@/features/security/components/email-security";
import { getEmailSecurity } from "@/features/security/email-security.server";
import { serverApiRequest } from "@/lib/api/server";

async function getAccountSessions(): Promise<AccountSessionList> {
  const result = await serverApiRequest<AccountSessionList>(
    "/api/account/sessions",
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return accountSessionListSchema.parse(result);
}

export default async function SecurityPage() {
  const [sessions, emailSecurity] = await Promise.all([
    getAccountSessions(),
    getEmailSecurity(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Security"
        description="Manage your password, email security, and active sessions."
        breadcrumbs={[
          {
            label: "Security",
          },
        ]}
      />

      <ChangePasswordForm />

      <ActiveSessions initialSessions={sessions.sessions} />

      <EmailSecurity initialData={emailSecurity} />
    </div>
  );
}
