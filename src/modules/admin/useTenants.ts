"use client";
import { useQuery } from "@tanstack/react-query";
import { listTenants } from "./tenants.api";

export function useTenants() {
  return useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: listTenants,
  });
}
