import { ApiCustomError } from "@/shared/errors/api-error";
import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";

export const verifyEmail = async (token: string): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/verify-email", { token });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data;
};
