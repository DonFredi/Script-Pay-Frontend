import { apiPrivate } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";
import type { RefreshDto } from "./refresh.types";

export const refresh = async (): Promise<RefreshDto> => {
  const response = await apiPrivate.post<ApiResponse<RefreshDto>>("/auth/refresh");
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
