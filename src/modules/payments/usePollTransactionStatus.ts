import { useQuery } from "@tanstack/react-query";
import { getTransactionStatus } from "./payments.api";

const TERMINAL_STATUSES = ["SETTLED", "FAILED", "REVERSED"];

/**
 * Replaces the previous Firestore onSnapshot(doc(db, "transactions", id)) listener.
 * Postgres has no built-in push mechanism the way Firestore does, so this polls —
 * matching the pattern the backend's own reconciliation design already assumes
 * (active status checks, not push-only). Stops polling once the transaction
 * reaches a terminal state, so it doesn't hammer the backend indefinitely.
 */
export function usePollTransactionStatus(transactionId: string | null) {
  return useQuery({
    queryKey: ["transaction-status", transactionId],
    queryFn: () => getTransactionStatus(transactionId as string),
    enabled: !!transactionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && TERMINAL_STATUSES.includes(status) ? false : 2500;
    },
  });
}
