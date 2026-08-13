import { ApiCustomError } from "@/shared/errors/api-error";
import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";

export const resendVerification = async (email: string): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/resend-verification", { email });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data;
};
