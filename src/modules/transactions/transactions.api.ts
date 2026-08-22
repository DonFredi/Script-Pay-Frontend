import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";
import type Transaction from "@/types";

/**
 * Matches GET /v1/transactions on the backend (transactions.controller.ts).
 * SUPER_ADMIN callers must pass tenantId explicitly — enforced server-side, this
 * function just forwards whatever's given.
 */
export const listTransactions = async (params?: { status?: string; tenantId?: string }): Promise<Transaction[]> => {
  const response = await api.get<ApiResponse<Transaction[]>>("/v1/transactions", { params });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

/**
 * Matches GET /v1/transactions/:id. No tenantId param needed — the backend scopes
 * by the caller's own tenant, or lets it through unscoped for SUPER_ADMIN, so this
 * one call backs both the tenant's own transaction detail page and the admin one.
 */
export const getTransaction = async (id: string): Promise<Transaction> => {
  const response = await api.get<ApiResponse<Transaction>>(`/v1/transactions/${id}`);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
