import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";
import type { LoginDto, LoginRequest } from "./login.types";

export const login = async (data: LoginRequest): Promise<LoginDto> => {
  const response = await api.post<ApiResponse<LoginDto>>("/auth/login", data);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
