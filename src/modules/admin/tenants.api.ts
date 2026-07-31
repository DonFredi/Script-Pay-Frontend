import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";

export interface Tenant {
  id: string;
  name: string;
  businessShortcode: string;
  status: string;
  createdAt: string;
}

/** Matches GET /v1/tenants (SUPER_ADMIN only, enforced server-side via @Roles). */
export const listTenants = async (): Promise<Tenant[]> => {
  const response = await api.get<ApiResponse<Tenant[]>>("/v1/tenants");
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
