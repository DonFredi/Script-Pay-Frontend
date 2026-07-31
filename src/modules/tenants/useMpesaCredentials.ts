"use client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { setMpesaCredentials } from "./mpesa-credentials.api";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import type { MpesaCredentialsFormData } from "./mpesa-credentials.schema";

export function useSetMpesaCredentials(tenantId: string) {
  return useMutation({
    mutationFn: (data: MpesaCredentialsFormData) => setMpesaCredentials(tenantId, data),
    onSuccess: () => {
      toast.success("M-Pesa credentials saved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
