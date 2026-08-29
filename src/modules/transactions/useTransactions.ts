"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransaction, listTransactions } from "./transactions.api";
import type { TransactionDirection } from "@/types";

interface UseTransactionsProps {
  tenantId?: string; // required for SUPER_ADMIN callers, ignored/unnecessary otherwise
  status?: string;
  // Omitting this returns both collections and payouts — they share one table
  // server-side (see transactions.api.ts) — so a caller meaning one direction
  // has to say so explicitly, same as `status`.
  direction?: TransactionDirection;
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
export const useTransactions = ({ tenantId, status, direction }: UseTransactionsProps = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", tenantId, status, direction],
    queryFn: () => listTransactions({ tenantId, status, direction }),
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
