"use client";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import TransactionsTable from "./sections/TransactionsTable";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { useTransactions } from "./useTransactions";

const TransactionsPage = () => {
  const { transactions, loading, error } = useTransactions();
  return (
    <PageWrapper>
      <SectionWrapper>
        <h1>Transactions</h1>
        <p>View and manage your transactions</p>
      </SectionWrapper>

      {error && <p className="text-sm text-destructive px-6">Could not load transactions: {error}</p>}
      <TransactionsTable transactions={transactions} loading={loading} />
    </PageWrapper>
  );
};
export default TransactionsPage;
