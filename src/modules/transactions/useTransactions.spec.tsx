import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTransaction, useTransactions } from "./useTransactions";
import { getTransaction, listTransactions } from "./transactions.api";
import type Transaction from "@/types";

// transactions.api.ts's own request/response handling is covered by
// api-client.spec.ts. This file covers what useTransactions.ts itself is
// responsible for: mapping react-query state onto the {transactions, loading,
// error} shape callers rely on (including the ?? [] default so consumers
// never have to null-check), forwarding tenantId/status params through, and
// useTransaction's enabled-only-with-an-id gating.
jest.mock("./transactions.api", () => ({
  listTransactions: jest.fn(),
  getTransaction: jest.fn(),
}));

const mockListTransactions = listTransactions as jest.Mock;
const mockGetTransaction = getTransaction as jest.Mock;

const makeTx = (id: string): Transaction => ({
  id,
  tenantId: "tenant-1",
  channel: "STK_PUSH",
  status: "SETTLED",
  amountMinorUnits: 10000,
  currency: "KES",
  msisdn: "254700000000",
  merchantRequestId: null,
  checkoutRequestId: null,
  mpesaReceiptNumber: null,
  failureReason: null,
  createdAt: "2026-08-25T00:00:00.000Z",
  updatedAt: "2026-08-25T00:00:00.000Z",
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns transactions and loading:false once the query resolves", async () => {
    mockListTransactions.mockResolvedValue([makeTx("tx-1"), makeTx("tx-2")]);

    const { result } = renderHook(() => useTransactions(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.transactions).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it("forwards tenantId and status through to listTransactions", async () => {
    mockListTransactions.mockResolvedValue([]);

    renderHook(() => useTransactions({ tenantId: "tenant-9", status: "PENDING" }), { wrapper });

    await waitFor(() =>
      expect(mockListTransactions).toHaveBeenCalledWith({ tenantId: "tenant-9", status: "PENDING" }),
    );
  });

  it("surfaces the error message and an empty array when the query fails", async () => {
    mockListTransactions.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe("network error"));

    expect(result.current.transactions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});

describe("useTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not fetch when id is empty", () => {
    renderHook(() => useTransaction(""), { wrapper });
    expect(mockGetTransaction).not.toHaveBeenCalled();
  });

  it("fetches the transaction by id when given one", async () => {
    mockGetTransaction.mockResolvedValue(makeTx("tx-1"));

    const { result } = renderHook(() => useTransaction("tx-1"), { wrapper });

    await waitFor(() => expect(result.current.data?.id).toBe("tx-1"));
    expect(mockGetTransaction).toHaveBeenCalledWith("tx-1");
  });
});
