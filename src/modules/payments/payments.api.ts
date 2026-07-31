import api from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import { ApiCustomError } from "@/shared/errors/api-error";
import type Transaction from "@/types";

export interface InitiateStkPushRequest {
  msisdn: string;
  amountMinorUnits: number;
  accountReference: string;
  transactionDesc: string;
  // Matches the backend's initiateStkPushSchema — determines whether Daraja
  // pushes a "pay bill" or "buy goods" PIN prompt. Omit for a plain STK push.
  channel?: "PAYBILL" | "TILL";
}

export interface InitiateStkPushResponse {
  transactionId: string;
  status: string;
}

export const initiateStkPush = async (data: InitiateStkPushRequest): Promise<InitiateStkPushResponse> => {
  const response = await api.post<ApiResponse<InitiateStkPushResponse>>("/v1/dashboard/payments/stk-push", data);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};

export const getTransactionStatus = async (transactionId: string): Promise<Transaction> => {
  const response = await api.get<ApiResponse<Transaction>>(`/v1/transactions/${transactionId}`);
  if (!response.data.success) throw new ApiCustomError(response.data.message, response.data.statusCode);
  return response.data.payload;
};
