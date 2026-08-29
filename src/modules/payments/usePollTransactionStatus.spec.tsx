import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePollTransactionStatus } from "./usePollTransactionStatus";
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
});
