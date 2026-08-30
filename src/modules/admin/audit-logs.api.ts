import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";

export interface AuditLogEntry {
  id: string;
  tenantId: string | null;
  actorType: string;
  actorId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** Matches GET /v1/audit-logs (SUPER_ADMIN or TENANT_ADMIN, tenant-scoping enforced server-side). */
export const listAuditLogs = async (params?: { tenantId?: string }): Promise<AuditLogEntry[]> => {
  const response = await api.get<ApiResponse<AuditLogEntry[]>>("/v1/audit-logs", { params });
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

/** Matches GET /v1/audit-logs/:id — tenant-scoping enforced server-side, same as listAuditLogs. */
export const getAuditLog = async (id: string): Promise<AuditLogEntry> => {
  const response = await api.get<ApiResponse<AuditLogEntry>>(`/v1/audit-logs/${id}`);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
