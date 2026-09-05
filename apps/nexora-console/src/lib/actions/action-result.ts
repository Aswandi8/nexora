import { ApiRequestError } from "@/lib/api/error";

export interface ActionResult {
  success: boolean;
  message?: string;
  fields?: Record<string, string[]>;
}

export function actionFailure<T extends ActionResult = ActionResult>(
  error: unknown,
  fallback: string,
): T {
  console.error(error);

  if (error instanceof ApiRequestError) {
    return {
      success: false,
      message: error.message,
      fields: error.fields,
    } as T;
  }

  return {
    success: false,
    message: fallback,
  } as T;
}
