"use client";

import Link from "next/link";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { useTransactions } from "@/modules/transactions/useTransactions";
import { TransactionStatsCards } from "@/modules/transactions/components/TransactionStatsCards";
import { TransactionVolumeChart } from "@/modules/transactions/components/TransactionVolumeChart";

/**
 * Previously imported and rendered the ADMIN dashboard component
 * (`../../admin/dashboard/page`) — meaning any regular tenant visiting /dashboard
 * saw (or was blocked by a 403 from) the SUPER_ADMIN-only tenants overview,
 * not their own dashboard. This is a real, standalone tenant landing page instead,
 * now with the transaction stats/chart block (adapted from shadcn's dashboard-01
 * block — see TransactionStatsCards/TransactionVolumeChart) computed from the
 * tenant's own transactions.
 */
export default function ClientDashboardPage() {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions();

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>Welcome back</PageHeading>
          <P className="text-muted-foreground">{user?.email}</P>
        </div>

        <TransactionStatsCards transactions={transactions} loading={loading} />
        {!loading && <TransactionVolumeChart transactions={transactions} />}

        <Link href="/payments" className="inline-block text-sm font-medium text-primary underline underline-offset-4">
          Go to payments →
        </Link>
      </SectionWrapper>
    </PageWrapper>
  );
}
