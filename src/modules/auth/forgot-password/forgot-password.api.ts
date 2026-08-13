import type { ApiResponse } from "@/shared/types";
import type { ForgotPasswordInput } from "./forgot-password.schema";
import { ApiCustomError } from "@/shared/errors/api-error";
import api from "@/shared/lib/api-client";

export const forgotPassword = async (data: ForgotPasswordInput): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/forgot-password", data);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data;
};
