"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenant, listTenants, updateTenantStatus, type TenantStatus } from "./tenants.api";

export function useTenants() {
  return useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: listTenants,
  });
}

/**
 * Tenants waiting on a SUPER_ADMIN's KYC review. Shares the ["admin","tenants"] cache
 * with useTenants (the status change invalidates both), but polls so a sign-up that
 * lands while an admin already has the dashboard open still shows up without a reload.
 */
export function usePendingTenants() {
  return useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: listTenants,
    refetchInterval: 60_000,
    select: (tenants) => tenants.filter((tenant) => tenant.status === "pending_kyc"),
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
