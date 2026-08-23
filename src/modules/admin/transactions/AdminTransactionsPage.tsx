"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTenants } from "@/modules/admin/useTenants";
import { useTransactions } from "@/modules/transactions/useTransactions";
import TransactionsTable from "@/modules/transactions/sections/TransactionsTable";
import { TransactionStatsCards } from "@/modules/transactions/components/TransactionStatsCards";
import { TransactionVolumeChart } from "@/modules/transactions/components/TransactionVolumeChart";
import type { TransactionStatus } from "@/types";

/**
 * Didn't exist before — was one of two admin nav links pointing at a 404
 * (the other being audit-logs). GET /v1/transactions requires SUPER_ADMIN callers
 * to pass ?tenantId= explicitly (enforced server-side), hence the picker below
 * rather than a bare cross-tenant list.
 *
 * The picker's value is mirrored into the URL (?tenantId=) so a tenant's detail
 * page (AdminTenantDetailPage) can deep-link straight into their transactions
 * pre-filtered, instead of landing here and re-picking them from the dropdown.
 *
 * If nothing was pre-selected via the URL, the first tenant is auto-picked once
 * the tenants list loads — landing on this page previously showed nothing but a
 * "pick a tenant" placeholder even though the picker itself was right there. The
 * ref guards this to run once per mount only, so manually clearing the picker
 * back to "Select a tenant…" isn't fought by the effect re-selecting it.
 */
// Radix's Select reserves an empty string for its own internal "no value" state,
// so the "Select a tenant…" clear option needs a real, non-empty value here.
const CLEAR_TENANT_VALUE = "__none__";

const STATUS_FILTERS: { value: TransactionStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SETTLED", label: "Settled" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERSED", label: "Reversed" },
];

export default function AdminTransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: tenants, isLoading: tenantsLoading } = useTenants();
  const [selectedTenantId, setSelectedTenantId] = useState<string>(searchParams.get("tenantId") ?? "");
  const [status, setStatus] = useState<TransactionStatus | "ALL">("ALL");
  const hasAutoSelected = useRef(false);

  function handleTenantChange(tenantId: string) {
    const normalized = tenantId === CLEAR_TENANT_VALUE ? "" : tenantId;
    setSelectedTenantId(normalized);
    router.replace(normalized ? `/admin/transactions?tenantId=${normalized}` : "/admin/transactions");
  }

  useEffect(() => {
    if (hasAutoSelected.current || selectedTenantId || !tenants?.length) return;
    hasAutoSelected.current = true;
    handleTenantChange(tenants[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenants, selectedTenantId]);

  // Fetched unfiltered (by tenant only) so the stats/chart reflect the whole
  // tenant, not just whatever status the table below happens to be filtered to.
  const { transactions: tenantTransactions, loading: statsLoading } = useTransactions({
    tenantId: selectedTenantId || undefined,
  });
  const { transactions, loading } = useTransactions({
    tenantId: selectedTenantId || undefined,
    status: status === "ALL" ? undefined : status,
  });

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>Transactions</PageHeading>
          <P className="text-muted-foreground">Pick a tenant to view their transaction history.</P>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select
            value={selectedTenantId || CLEAR_TENANT_VALUE}
            onValueChange={handleTenantChange}
            disabled={tenantsLoading}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a tenant…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CLEAR_TENANT_VALUE}>Select a tenant…</SelectItem>
              {tenants?.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(value) => setStatus(value as TransactionStatus | "ALL")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTenantId ? (
          <>
            <TransactionStatsCards transactions={tenantTransactions} loading={statsLoading} />
            {!statsLoading && <TransactionVolumeChart transactions={tenantTransactions} />}
            <TransactionsTable transactions={transactions} loading={loading} detailBasePath="/admin/transactions" />
          </>
        ) : (
          <P className="text-muted-foreground">Select a tenant above to see their transactions.</P>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
