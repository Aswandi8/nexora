"use client";

import {
  // startTransition,
  useState,
  useTransition,
  type MouseEvent,
  type ReactNode,
} from "react";

import type { AdminSession } from "@nexora/contracts/auth";

import { usePathname, useRouter } from "next/navigation";

import { WorkspaceLoading } from "@/components/feedback/workspace-loading";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";

interface DashboardShellProps {
  session: AdminSession;
  children: ReactNode;
}

function getInternalNavigationUrl(
  event: MouseEvent<HTMLDivElement>,
): string | null {
  if (event.defaultPrevented || event.button !== 0) {
    return null;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest("a");

  if (!(anchor instanceof HTMLAnchorElement)) {
    return null;
  }

  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  if (anchor.hasAttribute("download")) {
    return null;
  }

  if (!anchor.href) {
    return null;
  }

  const destination = new URL(anchor.href, window.location.href);

  if (destination.origin !== window.location.origin) {
    return null;
  }

  if (destination.pathname === window.location.pathname) {
    return null;
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function DashboardShell({ session, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [navigationPending, startNavigationTransition] = useTransition();

  function handleNavigationCapture(event: MouseEvent<HTMLDivElement>) {
    const destination = getInternalNavigationUrl(event);

    if (!destination) {
      return;
    }

    event.preventDefault();

    setMobileSidebarOpen(false);

    startNavigationTransition(() => {
      router.push(destination);
    });
  }

  return (
    <div
      onClickCapture={handleNavigationCapture}
      data-pathname={pathname}
      className="flex h-dvh min-h-0 w-full overflow-hidden bg-background text-foreground"
    >
      <Sidebar
        session={session}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <MobileSidebar
        session={session}
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          session={session}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="nexora-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {navigationPending && <WorkspaceLoading />}
    </div>
  );
}
