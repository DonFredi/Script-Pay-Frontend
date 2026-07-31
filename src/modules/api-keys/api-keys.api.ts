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

export interface CreateApiKeyResponse {
  id: string;
  rawKey: string; // shown exactly once — see the warning in the UI
  keyPrefix: string;
  scopes: string[];
}

/** Matches GET /v1/api-keys — tenant-scoped automatically server-side. */
export const listApiKeys = async (): Promise<ApiKeySummary[]> => {
  const response = await api.get<ApiResponse<ApiKeySummary[]>>("/v1/api-keys");
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

/** Matches POST /v1/api-keys. */
export const createApiKey = async (scopes: string[]): Promise<CreateApiKeyResponse> => {
  const response = await api.post<ApiResponse<CreateApiKeyResponse>>("/v1/api-keys", { scopes });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

/** Matches DELETE /v1/api-keys/:id. */
export const revokeApiKey = async (id: string): Promise<void> => {
  const response = await api.delete<ApiResponse<null>>(`/v1/api-keys/${id}`);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
};
