import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";

/**
 * Mirrors the backend's ApiKeyScope enum (prisma/schema.prisma). Kept in sync by
 * hand — there is no generated client — so a scope added on the backend has to be
 * added here too before it can be requested.
 */
export const API_KEY_SCOPES = [
  "PAYMENTS_INITIATE",
  "PAYMENTS_READ",
  "RECONCILIATION_READ",
  "WEBHOOKS_MANAGE",
  "PAYMENTS_DISBURSE",
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

/** What each scope actually permits, for the picker — not decoration. */
export const API_KEY_SCOPE_DESCRIPTIONS: Record<ApiKeyScope, string> = {
  PAYMENTS_INITIATE: "Start STK push payments (collect money from customers)",
  PAYMENTS_READ: "Read transactions and their status",
  RECONCILIATION_READ: "Read reconciliation and drift records",
  WEBHOOKS_MANAGE: "Register and rotate the tenant's webhook endpoint",
  PAYMENTS_DISBURSE: "Send money OUT to customers (B2C payouts) — can drain the tenant's balance",
};

/**
 * PAYMENTS_DISBURSE is the only scope that moves money away from the tenant. It is
 * deliberately not part of the set auto-provisioned on tenant activation, and is not
 * implied by PAYMENTS_INITIATE, so a key can only get it by someone ticking it here.
 * The picker warns before that happens.
 */
export const DANGEROUS_SCOPES: readonly ApiKeyScope[] = ["PAYMENTS_DISBURSE"];

export interface ApiKeySummary {
  id: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreatedApiKey {
  id: string;
  keyPrefix: string;
  scopes: string[];
  /** Returned exactly once, at creation. The backend stores only an argon2 hash. */
  rawKey: string;
}

/**
 * Matches POST /v1/api-keys?tenantId=. The raw key comes back once and is never
 * retrievable again — if the caller loses it, the only remedy is issuing a new key.
 */
export const createTenantApiKey = async (
  tenantId: string,
  scopes: ApiKeyScope[],
  expiresAt?: string,
): Promise<CreatedApiKey> => {
  const response = await api.post<ApiResponse<CreatedApiKey>>(
    "/v1/api-keys",
    { scopes, ...(expiresAt ? { expiresAt } : {}) },
    { params: { tenantId } },
  );
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

/** Matches GET /v1/api-keys?tenantId=. */
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
