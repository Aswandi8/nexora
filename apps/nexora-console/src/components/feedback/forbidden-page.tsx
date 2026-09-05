import { ErrorPage } from "@/components/feedback/error-page";

export function ForbiddenPage() {
  return (
    <ErrorPage
      code="403"
      title="Access denied"
      description="You do not have permission to access this area of Nexora Console."
      homeHref="/dashboard"
    />
  );
}
