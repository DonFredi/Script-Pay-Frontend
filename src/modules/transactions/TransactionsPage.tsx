"use client";
import { useState } from "react";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import TransactionsTable from "./sections/TransactionsTable";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "./useTransactions";
import type { TransactionStatus } from "@/types";

const STATUS_FILTERS: { value: TransactionStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SETTLED", label: "Settled" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERSED", label: "Reversed" },
];

const TransactionsPage = () => {
  const [status, setStatus] = useState<TransactionStatus | "ALL">("ALL");
  const { transactions, loading, error } = useTransactions({ status: status === "ALL" ? undefined : status });

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <PageHeading>Transactions</PageHeading>
            <P className="text-muted-foreground">View and manage your transactions</P>
          </div>
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
      </SectionWrapper>

      {error && <p className="text-sm text-destructive px-6">Could not load transactions: {error}</p>}
      <TransactionsTable transactions={transactions} loading={loading} />
    </PageWrapper>
  );
};
export default TransactionsPage;
