"use client";

import Link from "next/link";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { useTenants } from "@/modules/admin/useTenants";
import { AdminApiKeysTable } from "@/modules/admin/api-keys/AdminApiKeysTable";

/**
 * SUPER_ADMIN oversight of one tenant's API keys, entered from the tenant detail
 * page (tenant already known, so no picker needed) — deliberately read + revoke
 * only, no create form. Key creation lives on the sibling AdminApiKeysPage
 * (reached via a tenant picker instead of a known tenantId) using
 * CreateApiKeyForm, since that's the entry point staff use when deliberately
 * provisioning a key (e.g. granting PAYMENTS_DISBURSE) rather than responding to
 * an incident. This page stays revoke-focused so it can do one thing fast: kill a
 * key during an incident without needing tenant credentials or extra clicks.
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
