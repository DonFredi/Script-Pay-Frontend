import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionStatus } from "./payments.api";

const TERMINAL_STATUSES = ["SETTLED", "FAILED", "REVERSED"];

export const POLL_INTERVAL_MS = 2500;

/**
 * Polling gives up after this long even if the transaction is still PENDING or
 * PROCESSING.
 *
 * A Safaricom STK prompt expires on the customer's handset after about a minute, and
 * anything still unresolved well past that is no longer something this page can
 * report on — it belongs to the backend's own reconciliation (DriftDetectorService
 * re-queries stuck collections and escalates stuck payouts to a human). Polling past
 * that point tells the merchant nothing new while making one request every 2.5
 * seconds, forever, for as long as the tab stays open.
 *
 * Five minutes is deliberately generous next to the prompt's own lifetime, so a slow
 * but genuine confirmation is still caught here rather than handed off to the
 * transactions list.
 */
export const MAX_POLL_DURATION_MS = 5 * 60_000;
const MAX_POLLS = Math.ceil(MAX_POLL_DURATION_MS / POLL_INTERVAL_MS);

/**
 * Replaces the previous Firestore onSnapshot(doc(db, "transactions", id)) listener.
 * Postgres has no built-in push mechanism the way Firestore does, so this polls —
 * matching the pattern the backend's own reconciliation design already assumes
 * (active status checks, not push-only). Stops on a terminal status, and now also
 * stops after MAX_POLL_DURATION_MS on one that never reaches one.
 *
 * Returns `hasStoppedPolling` so a caller can say so plainly, rather than leaving a
 * spinner turning against a hook that has quietly given up.
 */
export function usePollTransactionStatus(transactionId: string | null) {
  const query = useQuery({
    queryKey: ["transaction-status", transactionId],
    queryFn: () => getTransactionStatus(transactionId as string),
    enabled: !!transactionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      // dataUpdateCount counts successful fetches, so this reads as "we have asked
      // this many times and it is still not terminal".
      if (query.state.dataUpdateCount >= MAX_POLLS) return false;
      return POLL_INTERVAL_MS;
    },
  });

  // dataUpdateCount is on the Query object handed to refetchInterval above, but not
  // on the hook's own result, so the same count is mirrored here to drive the
  // give-up flag.
  //
  // Adjusted during render rather than in an Effect — React's recommended approach
  // for state derived from a changing prop, and the same idiom StkPushSection and
  // B2cPayoutSection already use for their polled-transaction handling. `count` is
  // also read back locally rather than from state, so the flag returned below
  // reflects this render rather than lagging it by one pass.
  const { dataUpdatedAt } = query;
  const [tracker, setTracker] = useState({ id: transactionId, count: 0, lastAt: 0 });

  let pollCount = tracker.count;
  if (tracker.id !== transactionId) {
    // A different transaction — a second payment on the same form starts from zero
    // rather than inheriting the previous one's count.
    pollCount = 0;
    setTracker({ id: transactionId, count: 0, lastAt: 0 });
  } else if (dataUpdatedAt !== 0 && dataUpdatedAt !== tracker.lastAt) {
    pollCount = tracker.count + 1;
    setTracker({ id: transactionId, count: pollCount, lastAt: dataUpdatedAt });
  }

  const isTerminal = !!query.data?.status && TERMINAL_STATUSES.includes(query.data.status);

  return {
    ...query,
    /** True once polling gave up on a transaction that never reached a terminal state. */
    hasStoppedPolling: !isTerminal && pollCount >= MAX_POLLS,
  };
}
