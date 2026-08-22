"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenant, listTenants, updateTenantStatus, type TenantStatus } from "./tenants.api";

export function useTenants() {
  return useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: listTenants,
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ["admin", "tenants", id],
    queryFn: () => getTenant(id),
    enabled: !!id,
  });
}

export function useUpdateTenantStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: TenantStatus) => updateTenantStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
    },
  });
}
