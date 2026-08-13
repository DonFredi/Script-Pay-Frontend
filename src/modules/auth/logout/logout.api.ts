import { ApiCustomError } from "@/shared/errors/api-error";
import api from "@/shared/lib/api-client";

export const logout = async (): Promise<void> => {
  const response = await api.post("/profile/logout");
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data;
};
