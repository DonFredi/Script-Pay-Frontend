import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";
import type { MpesaCredentialsFormData } from "./mpesa-credentials.schema";

export interface SetMpesaCredentialsResponse {
  configured: boolean;
}

/**
 * Matches POST /v1/tenants/:id/mpesa-credentials. The secret/passkey are never
 * echoed back by the backend, even on success — this call only ever confirms
 * "configured: true", it can't be used to read the values back out.
 */
export const setMpesaCredentials = async (
  tenantId: string,
  data: MpesaCredentialsFormData,
): Promise<SetMpesaCredentialsResponse> => {
  const response = await api.post<ApiResponse<SetMpesaCredentialsResponse>>(
    `/v1/tenants/${tenantId}/mpesa-credentials`,
    data,
  );
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
