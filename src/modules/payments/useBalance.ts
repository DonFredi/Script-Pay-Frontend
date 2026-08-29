import { useQuery } from "@tanstack/react-query";
import { getBalance } from "./payments.api";

/**
 * Backs the balance display on the payout form. Refetched on an interval rather
 * than once, since a settling collection or payout changes this figure without
 * any action on this page — matches the polling pattern the rest of this module
 * already uses in place of Firestore's push updates.
 */
export function useBalance() {
  return useQuery({
    queryKey: ["ledger-balance"],
    queryFn: getBalance,
    refetchInterval: 10000,
  });
}
