import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";
import type { ShortcodeType } from "./tenant-shortcodes.schema";

export interface ShortcodeSummary {
  id: string;
  type: ShortcodeType;
  shortcode: string;
  isDefault: boolean;
  stkConfigured: boolean;
  payoutConfigured: boolean;
  createdAt: string;
}

export interface CreateShortcodeInput {
  type: ShortcodeType;
  shortcode: string;
  isDefault?: boolean;
  passkey?: string;
  initiatorName?: string;
  securityCredential?: string;
}

/**
 * tenantId is omitted for self-service (a TENANT_ADMIN managing their own
 * tenant) and passed for platform staff acting on a tenant's behalf — mirrors
 * admin/api-keys.api.ts's ?tenantId= convention exactly; see
 * TenantShortcodesController.resolveTenantId on the backend for the other half.
 */
export const listShortcodes = async (tenantId?: string): Promise<ShortcodeSummary[]> => {
  const response = await api.get<ApiResponse<ShortcodeSummary[]>>("/v1/tenant-shortcodes", {
    params: tenantId ? { tenantId } : undefined,
  });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

export const createShortcode = async (data: CreateShortcodeInput, tenantId?: string): Promise<ShortcodeSummary> => {
  const response = await api.post<ApiResponse<ShortcodeSummary>>("/v1/tenant-shortcodes", data, {
    params: tenantId ? { tenantId } : undefined,
  });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

export const updateShortcode = async (
  id: string,
  data: Partial<CreateShortcodeInput>,
  tenantId?: string,
): Promise<ShortcodeSummary> => {
  const response = await api.patch<ApiResponse<ShortcodeSummary>>(`/v1/tenant-shortcodes/${id}`, data, {
    params: tenantId ? { tenantId } : undefined,
  });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

export const removeShortcode = async (id: string, tenantId?: string): Promise<void> => {
  const response = await api.delete<ApiResponse<null>>(`/v1/tenant-shortcodes/${id}`, {
    params: tenantId ? { tenantId } : undefined,
  });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
};
