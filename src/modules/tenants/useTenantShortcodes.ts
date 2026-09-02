"use client";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createShortcode,
  listShortcodes,
  removeShortcode,
  updateShortcode,
  type CreateShortcodeInput,
  type ShortcodeSummary,
} from "./tenant-shortcodes.api";
import { getErrorMessage } from "@/shared/utils/get-error-message";

const queryKey = (tenantId?: string) => ["tenant-shortcodes", tenantId ?? "self"];

/**
 * The backend resolves a default shortcode per-type (findFirst({ type, isDefault:
 * true })), and never unsets a previous default itself — so the frontend is the
 * only place enforcing "at most one default per type." Reads the already-fetched
 * list straight from the query cache rather than refetching, since both callers
 * below run right after a mutation that already targeted this same list.
 */
async function unsetOtherDefaults(
  queryClient: QueryClient,
  tenantId: string | undefined,
  type: ShortcodeSummary["type"],
  keepId: string,
) {
  const current = queryClient.getQueryData<ShortcodeSummary[]>(queryKey(tenantId)) ?? [];
  const others = current.filter((s) => s.type === type && s.isDefault && s.id !== keepId);
  await Promise.all(others.map((s) => updateShortcode(s.id, { isDefault: false }, tenantId)));
}

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
    onSuccess: async (created) => {
      if (created.isDefault) {
        await unsetOtherDefaults(queryClient, tenantId, created.type, created.id);
      }
      queryClient.invalidateQueries({ queryKey: queryKey(tenantId) });
      toast.success("Shortcode added");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSetDefaultShortcode(tenantId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = queryClient.getQueryData<ShortcodeSummary[]>(queryKey(tenantId)) ?? [];
      const target = current.find((s) => s.id === id);
      const updated = await updateShortcode(id, { isDefault: true }, tenantId);
      if (target) {
        await unsetOtherDefaults(queryClient, tenantId, target.type, id);
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(tenantId) });
      toast.success("Default shortcode updated");
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
