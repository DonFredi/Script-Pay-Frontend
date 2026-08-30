import api, { apiPrivate, setAccessToken } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";

export interface OnboardTenantRequest {
  name: string;
  businessShortcode: string;
}

export interface Tenant {
  id: string;
  name: string;
  status: string;
}

/**
 * Matches POST /v1/tenants/onboard on the backend (tenants.controller.ts) — the
 * self-service path a freshly-registered TENANT_ADMIN with no tenant yet hits.
 * Afterward, the CURRENT access token still has tenantId: null baked into its
 * claims (it was signed before this call), so this also forces a token refresh
 * immediately — otherwise every subsequent request would still look like it's
 * coming from a tenant-less account until the token naturally expired.
 */
export const onboardTenant = async (data: OnboardTenantRequest): Promise<Tenant> => {
  const response = await api.post<ApiResponse<Tenant>>("/v1/tenants/onboard", data);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);

  const refreshResponse = await apiPrivate.post("/auth/refresh", {});
  const newAccessToken: string | null = refreshResponse.data?.payload?.accessToken ?? null;
  if (newAccessToken) setAccessToken(newAccessToken);

  return response.data.payload;
};
