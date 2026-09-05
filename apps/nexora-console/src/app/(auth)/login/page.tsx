import type { Metadata } from "next";

import { BarChart3, Layers3, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Typography } from "@/components/ui/typography";
import { redirectIfAuthenticated } from "@/features/auth/auth.server";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

const features = [
  {
    icon: Layers3,
    title: "Centralized workspace",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
  },
  {
    icon: BarChart3,
    title: "Built for growth",
  },
];

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="dark h-dvh overflow-hidden bg-background text-foreground">
      <div className="grid h-full overflow-hidden lg:grid-cols-2">
        <section className="relative hidden h-full overflow-hidden border-r border-border lg:flex lg:flex-col">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_38%,var(--brand-500)_0%,transparent_37%)] opacity-[0.15]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-size-[64px_64px] opacity-35"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-brand-500/15 to-transparent"
          />

          <div className="relative z-10 flex min-h-0 flex-1 items-center px-12 xl:px-16 2xl:px-24">
            <div className="max-w-xl">
              <Logo
                priority
                width={420}
                height={130}
                className="mb-8 h-auto w-64 xl:mb-10 xl:w-72 2xl:w-80"
              />

              <Typography
                variant="body"
                className="max-w-lg text-base leading-7 text-muted-foreground"
              >
                One workspace to manage your links, publishing, users,
                integrations, and analytics with clarity and control.
              </Typography>

              <div className="mt-7 grid gap-4 xl:mt-8 xl:gap-5">
                {features.map(({ icon: Icon, title }) => (
                  <div key={title} className="flex items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-300 xl:size-11">
                      <Icon className="size-5" />
                    </div>

                    <Typography as="p" variant="h4">
                      {title}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-4 px-12 pb-8 xl:px-16 xl:pb-10 2xl:px-24">
            <span className="h-px w-10 bg-brand-300" />

            <Typography
              variant="eyebrow"
              className="tracking-[0.3em] text-muted-foreground"
            >
              CREATE · STREAM · GROW
            </Typography>
          </div>
        </section>

        <section className="relative flex h-full min-h-0 items-center justify-center overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl lg:hidden"
          />

          <div className="relative z-10 flex max-h-full w-full max-w-md flex-col py-6 sm:py-8 lg:py-6">
            <div className="mb-8 shrink-0 lg:hidden">
              <Logo priority width={180} height={54} className="h-auto w-36" />
            </div>

            <div className="grid gap-6 sm:gap-7 lg:gap-8">
              <header className="grid gap-3">
                <div className="flex items-center gap-2 text-brand-300">
                  <ShieldCheck className="size-4" />

                  <Typography variant="eyebrow" className="text-brand-300">
                    Secure access
                  </Typography>
                </div>

                <Typography
                  as="h1"
                  variant="display"
                  className="text-4xl sm:text-5xl lg:text-4xl xl:text-5xl"
                >
                  Welcome back
                </Typography>

                <Typography variant="body" className="text-muted-foreground">
                  Sign in to continue to your Nexora workspace.
                </Typography>
              </header>

              <LoginForm />

              <div className="border-t border-border pt-5 lg:pt-6">
                <Typography variant="muted" className="leading-6">
                  By signing in, you are accessing a protected Nexora workspace.
                </Typography>
              </div>
            </div>

            <div className="mt-8 flex shrink-0 items-center gap-3 lg:hidden">
              <span className="h-px w-8 bg-brand-300" />

              <Typography
                variant="eyebrow"
                className="tracking-[0.28em] text-muted-foreground"
              >
                CREATE · STREAM · GROW
              </Typography>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
