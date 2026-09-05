export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiErrorDetail = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

export type ApiFailure = {
  success: false;
  error: ApiErrorDetail;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
