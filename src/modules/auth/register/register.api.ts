import api from "@/shared/lib/api-client";
import type { RegisterInput } from "./register.schema";
import { ApiCustomError } from "@/shared/errors/api-error";
import { ApiResponse } from "@/shared/types";
import type { RegisterDto } from "./register.types";

export const register = async (data: RegisterInput): Promise<RegisterDto> => {
  const response = await api.post<ApiResponse<RegisterDto>>("/auth/signup", data);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
