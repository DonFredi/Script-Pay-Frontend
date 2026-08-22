"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransaction, listTransactions } from "./transactions.api";

interface UseTransactionsProps {
  tenantId?: string; // required for SUPER_ADMIN callers, ignored/unnecessary otherwise
  status?: string;
}

/**
 * Previously a Firestore onSnapshot listener (collection(db, "transactions")) —
 * the last file in the payments/transactions chain still on that pattern; every
 * sibling file here (payments.api.ts, transactions.api.ts,
 * usePollTransactionStatus.ts, TransactionsTable.tsx) was already fixed to expect
 * this real backend shape. Postgres has no built-in push mechanism the way
 * Firestore does, so this polls on an interval instead of subscribing — matches
 * the same tradeoff usePollTransactionStatus already makes for a single transaction.
 */
export const useTransactions = ({ tenantId, status }: UseTransactionsProps = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", tenantId, status],
    queryFn: () => listTransactions({ tenantId, status }),
    refetchInterval: 5000,
  });

  return {
    transactions: data ?? [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => getTransaction(id),
    enabled: !!id,
  });
};
