"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTenant, useUpdateTenantStatus } from "@/modules/admin/useTenants";
import type { TenantStatus } from "@/modules/admin/tenants.api";

const STATUS_OPTIONS: TenantStatus[] = ["active", "suspended", "pending_kyc", "removed"];

/**
 * Single-tenant overview for platform staff — the tenants list only ever showed
 * a flat table with a direct link into "API keys"; there was nowhere to see a
 * tenant's own status/onboarding details or change its status without going
 * through the API directly. This page fills that gap and is what the tenants
 * table row now links to.
 */
export function AdminTenantDetailPage({ tenantId }: { tenantId: string }) {
  const { data: tenant, isLoading, error } = useTenant(tenantId);
  const updateStatus = useUpdateTenantStatus(tenantId);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  async function handleStatusChange(status: TenantStatus) {
    try {
      await updateStatus.mutateAsync(status);
      toast.success("Tenant status updated");
    } catch {
      toast.error("Could not update tenant status");
    }
  }

  // "removed" is a platform-only kill switch (see TenantsService.updateStatus)
  // and harder to reverse than a self-service suspend, so it's the one status
  // that requires confirmation instead of firing immediately on select.
  function handleStatusSelect(status: TenantStatus) {
    if (status === "removed") {
      setConfirmRemoveOpen(true);
      return;
    }
    void handleStatusChange(status);
  }

  async function confirmRemove() {
    await handleStatusChange("removed");
    setConfirmRemoveOpen(false);
  }

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <Link href="/admin/dashboard" className="text-sm text-muted-foreground underline">
            ← Tenants
          </Link>
          <PageHeading>{isLoading ? "Loading…" : (tenant?.name ?? "Tenant")}</PageHeading>
        </div>

        {error && <P className="text-destructive">Could not load this tenant.</P>}

        {tenant && (
          <>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-md">
              <div>
                <dt className="text-xs text-muted-foreground">Shortcode</dt>
                <dd className="font-medium">{tenant.businessShortcode}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Onboarded</dt>
                <dd>{new Date(tenant.createdAt).toLocaleDateString("en-KE")}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">M-Pesa credentials</dt>
                <dd>{tenant.mpesaCredentialsConfiguredAt ? "Configured" : "Not configured"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd>
                  <select
                    value={tenant.status}
                    onChange={(e) => handleStatusSelect(e.target.value as TenantStatus)}
                    disabled={updateStatus.isPending}
                    className="rounded-md border border-input bg-background px-2 py-1 text-sm capitalize"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status} className="capitalize">
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
            </dl>

            <div className="flex gap-4">
              <Link href={`/admin/tenants/${tenant.id}/api-keys`} className="text-sm underline">
                API keys →
              </Link>
              <Link href={`/admin/transactions?tenantId=${tenant.id}`} className="text-sm underline">
                Transactions →
              </Link>
              <Link href={`/admin/audit-logs?tenantId=${tenant.id}`} className="text-sm underline">
                Audit logs →
              </Link>
            </div>

            <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove {tenant.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This blocks all payments in both directions for this tenant. Only a SUPER_ADMIN can reactivate
                    it afterwards.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void confirmRemove()}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Remove tenant
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
