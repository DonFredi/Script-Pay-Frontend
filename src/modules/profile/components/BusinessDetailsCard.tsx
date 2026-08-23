"use client";

import { useTenant } from "@/modules/admin/useTenants";
import { P } from "@/shared/components/ui/Typography";

/**
 * GET /v1/tenants/:id has no @Roles() guard — a tenant viewing their own
 * tenantId is allowed, same as TransactionDetailPage's receipt business-name
 * lookup — so this reuses that hook rather than needing a separate endpoint.
 */
export function BusinessDetailsCard({ tenantId }: { tenantId: string }) {
  const { data: tenant, isLoading, error } = useTenant(tenantId);

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4">Business</h3>
      {isLoading && <P className="text-muted-foreground">Loading…</P>}
      {error && <P className="text-destructive">Could not load business details.</P>}
      {tenant && (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Business name</dt>
            <dd>{tenant.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Paybill / Till number</dt>
            <dd>{tenant.businessShortcode}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="capitalize">{tenant.status.replace("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Onboarded</dt>
            <dd>{new Date(tenant.createdAt).toLocaleDateString("en-KE")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">M-Pesa credentials</dt>
            <dd>{tenant.mpesaCredentialsConfiguredAt ? "Configured" : "Not configured"}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
