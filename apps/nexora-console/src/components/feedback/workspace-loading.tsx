import { Logo } from "@/components/brand/logo";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface WorkspaceLoadingProps {
  className?: string;
}

export function WorkspaceLoading({ className }: WorkspaceLoadingProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--brand-500)_0%,transparent_34%)] opacity-[0.07]"
      />

      <div className="relative z-10 grid w-full max-w-md justify-items-center gap-8 px-8 text-center">
        <Logo
          priority
          width={300}
          height={90}
          className="h-auto w-56 sm:w-64"
        />

        <div className="grid gap-3">
          <Typography
            as="p"
            variant="body"
            className="text-base text-muted-foreground"
          >
            Preparing your workspace
          </Typography>

          <Typography
            variant="eyebrow"
            className="tracking-[0.34em] text-muted-foreground"
          >
            CREATE · STREAM · GROW
          </Typography>
        </div>

        <div
          className="relative h-1 w-64 overflow-hidden rounded-full bg-secondary sm:w-72"
          role="progressbar"
          aria-label="Preparing Nexora workspace"
        >
          <div className="absolute inset-y-0 left-0 w-1/3 animate-[nexora-loading_1.35s_ease-in-out_infinite] rounded-full bg-brand-400 shadow-[0_0_14px_var(--brand-500)]" />
        </div>
      </div>
    </div>
  );
}
