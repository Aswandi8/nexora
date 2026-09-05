import { ErrorPage } from "@/components/feedback/error-page";

export function UnauthorizedPage() {
  return (
    <ErrorPage
      code="401"
      title="Authentication required"
      description="Your session is missing or has expired. Sign in again to continue."
      showBackButton={false}
      homeHref="/login"
    />
  );
}
