import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";

export type TenantStatus = "active" | "suspended" | "pending_kyc";

export interface Tenant {
  id: string;
  name: string;
  businessShortcode: string;
  status: string;
  createdAt: string;
  mpesaCredentialsConfiguredAt?: string | null;
}

/** Matches GET /v1/tenants (SUPER_ADMIN only, enforced server-side via @Roles). */
export const listTenants = async (): Promise<Tenant[]> => {
  const response = await api.get<ApiResponse<Tenant[]>>("/v1/tenants");
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

/**
 * Matches GET /v1/tenants/:id. No @Roles() guard on the backend route — a
 * TENANT_ADMIN/TENANT_STAFF calling this for their own tenant is also allowed —
 * but this hook is only ever wired up from admin/* pages, which are already
 * SUPER_ADMIN-gated by admin/layout.tsx.
 */
export const getTenant = async (id: string): Promise<Tenant> => {
  const response = await api.get<ApiResponse<Tenant>>(`/v1/tenants/${id}`);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

/** Matches PATCH /v1/tenants/:id/status (SUPER_ADMIN, or a tenant admin acting on their own tenant). */
export const updateTenantStatus = async (id: string, status: TenantStatus): Promise<Tenant> => {
  const response = await api.patch<ApiResponse<Tenant>>(`/v1/tenants/${id}/status`, { status });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
