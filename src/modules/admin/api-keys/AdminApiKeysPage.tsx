"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { useTenants } from "@/modules/admin/useTenants";
import { AdminApiKeysTable } from "./AdminApiKeysTable";
import { CreateApiKeyForm } from "./CreateApiKeyForm";

/**
 * Top-level nav entry point for API keys. GET /v1/api-keys requires SUPER_ADMIN
 * callers to pass ?tenantId= explicitly (enforced server-side, no "all tenants"
 * mode exists) — same constraint AdminTransactionsPage has, so this follows the
 * same tenant-picker-first pattern rather than a bare list.
 *
 * If nothing was pre-selected via the URL, the first tenant is auto-picked once
 * the tenants list loads, same as AdminTransactionsPage — the ref guards this to
 * run once per mount so manually clearing the picker isn't fought by the effect.
 */
export default function AdminApiKeysPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: tenants, isLoading: tenantsLoading } = useTenants();
  const [selectedTenantId, setSelectedTenantId] = useState<string>(searchParams.get("tenantId") ?? "");
  const hasAutoSelected = useRef(false);

  function handleTenantChange(tenantId: string) {
    setSelectedTenantId(tenantId);
    router.replace(tenantId ? `/admin/api-keys?tenantId=${tenantId}` : "/admin/api-keys");
  }

  useEffect(() => {
    if (hasAutoSelected.current || selectedTenantId || !tenants?.length) return;
    hasAutoSelected.current = true;
    handleTenantChange(tenants[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenants, selectedTenantId]);

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>API Keys</PageHeading>
          <P className="text-muted-foreground">Pick a tenant to view and manage their API keys.</P>
        </div>

        <select
          value={selectedTenantId}
          onChange={(e) => handleTenantChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled={tenantsLoading}
        >
          <option value="">Select a tenant…</option>
          {tenants?.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>

        {selectedTenantId ? (
          <>
            <AdminApiKeysTable tenantId={selectedTenantId} />
            <CreateApiKeyForm tenantId={selectedTenantId} />
          </>
        ) : (
          <P className="text-muted-foreground">Select a tenant above to see their API keys.</P>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
