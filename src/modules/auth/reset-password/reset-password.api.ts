import type { ApiResponse } from "@/shared/types";
import api from "@/shared/lib/api-client";
import { ApiCustomError } from "@/shared/errors/api-error";
import type { ResetPasswordRequest } from "./reset-password.types";

export const resetPassword = async (data: ResetPasswordRequest): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/reset-password", data);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data;
};
