export type ApiSuccess<T> = {
  success: true;
  message: string;
  statusCode: number;
  payload: T;
};

export type ApiError = {
  success: false;
  message: string;
  statusCode: number;
  error?: {
    code?: string;
    details?: unknown;
  };
};

export type ApiResponse<T = null> = ApiSuccess<T> | ApiError;
