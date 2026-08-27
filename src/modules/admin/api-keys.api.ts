import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";

export interface ApiKeySummary {
  id: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

/** Matches GET /v1/api-keys?tenantId= (SUPER_ADMIN oversight — read-only, no create). */
export const listTenantApiKeys = async (tenantId: string): Promise<ApiKeySummary[]> => {
  const response = await api.get<ApiResponse<ApiKeySummary[]>>("/v1/api-keys", { params: { tenantId } });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

/** Matches DELETE /v1/api-keys/:id?tenantId= — for incident response, not routine use. */
export const revokeTenantApiKey = async (tenantId: string, id: string): Promise<void> => {
  const response = await api.delete<ApiResponse<null>>(`/v1/api-keys/${id}`, { params: { tenantId } });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
};
