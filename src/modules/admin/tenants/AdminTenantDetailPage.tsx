"use client";

import Link from "next/link";
import { toast } from "sonner";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { useTenant, useUpdateTenantStatus } from "@/modules/admin/useTenants";
import type { TenantStatus } from "@/modules/admin/tenants.api";

const STATUS_OPTIONS: TenantStatus[] = ["active", "suspended", "pending_kyc"];

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

  async function handleStatusChange(status: TenantStatus) {
    try {
      await updateStatus.mutateAsync(status);
      toast.success("Tenant status updated");
    } catch {
      toast.error("Could not update tenant status");
    }
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
                    onChange={(e) => handleStatusChange(e.target.value as TenantStatus)}
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
          </>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
