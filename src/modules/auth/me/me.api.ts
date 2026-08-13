import api from "@/shared/lib/api-client";
import type { User } from "../shared/types";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>("/profile");
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
