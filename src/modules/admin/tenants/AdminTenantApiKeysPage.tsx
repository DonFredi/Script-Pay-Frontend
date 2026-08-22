"use client";

import Link from "next/link";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { useTenants } from "@/modules/admin/useTenants";
import { AdminApiKeysTable } from "@/modules/admin/api-keys/AdminApiKeysTable";

/**
 * SUPER_ADMIN oversight of one tenant's API keys — read + revoke only. There is no
 * create form here on purpose: key issuance stays tenant self-service (see
 * docs/decisions.md); this page exists so platform staff can audit or kill a key
 * during an incident without needing tenant credentials. Arrived here already
 * knowing the tenant (from the tenant detail page) — AdminApiKeysPage is the
 * sibling entry point for reaching the same table via a tenant picker instead.
 */
export function AdminTenantApiKeysPage({ tenantId }: { tenantId: string }) {
  const { data: tenants } = useTenants();
  const tenantName = tenants?.find((t) => t.id === tenantId)?.name ?? tenantId;

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <Link href={`/admin/tenants/${tenantId}`} className="text-sm text-muted-foreground underline">
            ← {tenantName}
          </Link>
          <PageHeading>API keys — {tenantName}</PageHeading>
          <P className="text-muted-foreground">Read-only oversight. Revoke here only for incident response.</P>
        </div>

        <AdminApiKeysTable tenantId={tenantId} />
      </SectionWrapper>
    </PageWrapper>
  );
}
