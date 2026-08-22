"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { useTenants } from "@/modules/admin/useTenants";
import { useTransactions } from "@/modules/transactions/useTransactions";
import TransactionsTable from "@/modules/transactions/sections/TransactionsTable";

/**
 * Didn't exist before — was one of two admin nav links pointing at a 404
 * (the other being audit-logs). GET /v1/transactions requires SUPER_ADMIN callers
 * to pass ?tenantId= explicitly (enforced server-side), hence the picker below
 * rather than a bare cross-tenant list.
 *
 * The picker's value is mirrored into the URL (?tenantId=) so a tenant's detail
 * page (AdminTenantDetailPage) can deep-link straight into their transactions
 * pre-filtered, instead of landing here and re-picking them from the dropdown.
 */
export default function AdminTransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: tenants, isLoading: tenantsLoading } = useTenants();
  const [selectedTenantId, setSelectedTenantId] = useState<string>(searchParams.get("tenantId") ?? "");

  function handleTenantChange(tenantId: string) {
    setSelectedTenantId(tenantId);
    router.replace(tenantId ? `/admin/transactions?tenantId=${tenantId}` : "/admin/transactions");
  }

  const { transactions, loading } = useTransactions({ tenantId: selectedTenantId || undefined });

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>Transactions</PageHeading>
          <P className="text-muted-foreground">Pick a tenant to view their transaction history.</P>
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
          <TransactionsTable transactions={transactions} loading={loading} />
        ) : (
          <P className="text-muted-foreground">Select a tenant above to see their transactions.</P>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
