"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTenantApiKey, listTenantApiKeys, revokeTenantApiKey, type ApiKeyScope } from "./api-keys.api";

export function useTenantApiKeys(tenantId: string) {
  return useQuery({
    queryKey: ["admin", "tenants", tenantId, "api-keys"],
    queryFn: () => listTenantApiKeys(tenantId),
    enabled: !!tenantId,
  });
}

export function useCreateTenantApiKey(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scopes, expiresAt }: { scopes: ApiKeyScope[]; expiresAt?: string }) =>
      createTenantApiKey(tenantId, scopes, expiresAt),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tenants", tenantId, "api-keys"] }),
  });
}

export function useRevokeTenantApiKey(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeTenantApiKey(tenantId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tenants", tenantId, "api-keys"] }),
  });
}
