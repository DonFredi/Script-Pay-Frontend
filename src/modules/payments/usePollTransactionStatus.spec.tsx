import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePollTransactionStatus, MAX_POLL_DURATION_MS, POLL_INTERVAL_MS } from "./usePollTransactionStatus";
import { getTransactionStatus } from "./payments.api";
import type Transaction from "@/types";

// payments.api.ts's own request/response handling is covered by
// api-client.spec.ts. This file covers the payment-critical logic that lives
// only in usePollTransactionStatus.ts itself: which statuses count as
// terminal (stop polling) vs not (keep polling every 2.5s) — a bug here would
// either poll a settled payment forever or freeze on a still-pending one.
jest.mock("./payments.api", () => ({ getTransactionStatus: jest.fn() }));

const mockGetStatus = getTransactionStatus as jest.Mock;

const makeTx = (status: Transaction["status"]): Transaction => ({
  id: "tx-1",
  tenantId: "tenant-1",
  channel: "STK_PUSH",
  direction: "INBOUND",
  status,
  amountMinorUnits: 10000,
  currency: "KES",
  msisdn: "254700000000",
  merchantRequestId: null,
  checkoutRequestId: null,
  originatorConversationId: null,
  conversationId: null,
  mpesaReceiptNumber: null,
  failureReason: null,
  payoutRemarks: null,
  payoutOccasion: null,
  createdAt: "2026-08-25T00:00:00.000Z",
  updatedAt: "2026-08-25T00:00:00.000Z",
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("usePollTransactionStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not fetch when transactionId is null", () => {
    renderHook(() => usePollTransactionStatus(null), { wrapper });
    expect(mockGetStatus).not.toHaveBeenCalled();
  });

  it.each(["SETTLED", "FAILED", "REVERSED"] as const)(
    "stops polling once the terminal status %s is reached",
    async (status) => {
      mockGetStatus.mockResolvedValue(makeTx(status));

      const { result } = renderHook(() => usePollTransactionStatus("tx-1"), { wrapper });

      await waitFor(() => expect(result.current.data?.status).toBe(status));
      expect(mockGetStatus).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(10000);

      expect(mockGetStatus).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["PENDING", "PROCESSING"] as const)(
    "keeps polling every 2.5s while status is %s",
    async (status) => {
      mockGetStatus.mockResolvedValue(makeTx(status));

      const { result } = renderHook(() => usePollTransactionStatus("tx-1"), { wrapper });

      await waitFor(() => expect(result.current.data?.status).toBe(status));
      expect(mockGetStatus).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(2500);
      await waitFor(() => expect(mockGetStatus).toHaveBeenCalledTimes(2));

      await jest.advanceTimersByTimeAsync(2500);
      await waitFor(() => expect(mockGetStatus).toHaveBeenCalledTimes(3));
    },
  );

  // Without a ceiling, a transaction that never reaches a terminal state is polled
  // every 2.5s for as long as the tab stays open. That is exactly what happens today
  // whenever a Daraja callback goes unprocessed, so it is not a hypothetical.
  describe("giving up on a transaction that never resolves", () => {
    it("stops polling after the maximum duration and reports that it stopped", async () => {
      mockGetStatus.mockResolvedValue(makeTx("PROCESSING"));

      const { result } = renderHook(() => usePollTransactionStatus("tx-1"), { wrapper });

      await waitFor(() => expect(result.current.data?.status).toBe("PROCESSING"));
      expect(result.current.hasStoppedPolling).toBe(false);

      // Run past the ceiling, with slack so the final scheduled poll lands.
      await jest.advanceTimersByTimeAsync(MAX_POLL_DURATION_MS + POLL_INTERVAL_MS * 2);
      await waitFor(() => expect(result.current.hasStoppedPolling).toBe(true));

      const callsAtGiveUp = mockGetStatus.mock.calls.length;
      await jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 10);
      expect(mockGetStatus).toHaveBeenCalledTimes(callsAtGiveUp);
      // Sanity-check the ceiling actually bounded things, rather than the test
      // passing because polling broke for some unrelated reason.
      expect(callsAtGiveUp).toBeGreaterThan(50);
      expect(callsAtGiveUp).toBeLessThanOrEqual(MAX_POLL_DURATION_MS / POLL_INTERVAL_MS + 2);
      // Driving five simulated minutes means ~120 sequential poll cycles, each with
      // its own promise flush — genuinely slower than jest's 5s default, and not a
      // sign of anything hanging.
    }, 60_000);

    // The hook mirrors react-query's own dataUpdateCount to drive the give-up
    // flag, and that mirror has to be reset per transaction. Without this, a
    // merchant taking a second payment on the same form would inherit the first
    // one's exhausted count and see "we've stopped checking" immediately.
    it("starts a fresh count when the transaction id changes", async () => {
      mockGetStatus.mockResolvedValue(makeTx("PROCESSING"));

      // One QueryClient for the whole test: the shared `wrapper` above builds a
      // new one per render, which would throw away the cache across a rerender.
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const stableWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result, rerender } = renderHook(({ id }) => usePollTransactionStatus(id), {
        wrapper: stableWrapper,
        initialProps: { id: "tx-1" as string | null },
      });

      await waitFor(() => expect(result.current.data?.status).toBe("PROCESSING"));

      rerender({ id: "tx-2" });

      await waitFor(() => expect(mockGetStatus).toHaveBeenCalledWith("tx-2"));
      expect(result.current.hasStoppedPolling).toBe(false);
    });

    it("does not report giving up on a transaction that settled normally", async () => {
      mockGetStatus.mockResolvedValue(makeTx("SETTLED"));

      const { result } = renderHook(() => usePollTransactionStatus("tx-1"), { wrapper });

      await waitFor(() => expect(result.current.data?.status).toBe("SETTLED"));
      await jest.advanceTimersByTimeAsync(MAX_POLL_DURATION_MS * 2);

      expect(result.current.hasStoppedPolling).toBe(false);
    });
  });
});
