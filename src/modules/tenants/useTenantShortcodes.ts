"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createShortcode, listShortcodes, removeShortcode, type CreateShortcodeInput } from "./tenant-shortcodes.api";
import { getErrorMessage } from "@/shared/utils/get-error-message";

const queryKey = (tenantId?: string) => ["tenant-shortcodes", tenantId ?? "self"];

export function useTenantShortcodes(tenantId?: string) {
  return useQuery({
    queryKey: queryKey(tenantId),
    queryFn: () => listShortcodes(tenantId),
  });
}

export function useCreateShortcode(tenantId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShortcodeInput) => createShortcode(data, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(tenantId) });
      toast.success("Shortcode added");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRemoveShortcode(tenantId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeShortcode(id, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(tenantId) });
      toast.success("Shortcode removed");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
