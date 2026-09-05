import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import B2cPayoutSection from "./B2cPayoutSection";
import { initiateB2c } from "../payments.api";
import { usePollTransactionStatus } from "../usePollTransactionStatus";
import { useBalance } from "../useBalance";
import { useTenantShortcodes } from "@/modules/tenants/useTenantShortcodes";
import { useAuthContext } from "@/providers/AuthProvider";
import type Transaction from "@/types";

// The money-OUT trigger, and the riskier of the two payment forms: a collection
// that goes wrong costs a customer a retry, a payout that goes wrong sends real
// money from the tenant's own balance to the wrong person, twice. So this covers
// what only lives inline here: the TENANT_ADMIN gate, phone normalization and
// minor-units conversion, and — the one with no counterpart on the collection
// side — the idempotency key's lifecycle, which is the only thing standing
// between a retried submit and a second real disbursement.
jest.mock("../payments.api", () => ({ initiateB2c: jest.fn() }));
jest.mock("../usePollTransactionStatus", () => ({ usePollTransactionStatus: jest.fn() }));
jest.mock("../useBalance", () => ({ useBalance: jest.fn() }));
jest.mock("@/modules/tenants/useTenantShortcodes", () => ({ useTenantShortcodes: jest.fn() }));
jest.mock("@/providers/AuthProvider", () => ({ useAuthContext: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockInitiateB2c = initiateB2c as jest.Mock;
const mockUsePollTransactionStatus = usePollTransactionStatus as jest.Mock;
const mockUseBalance = useBalance as jest.Mock;
const mockUseTenantShortcodes = useTenantShortcodes as jest.Mock;
const mockUseAuthContext = useAuthContext as jest.Mock;

// jsdom's crypto has getRandomValues but not always randomUUID, and the component
// mints its idempotency key from it at mount. Sequential values make the key's
// lifecycle assertable rather than just present.
let uuidCounter = 0;
const randomUUID = jest.fn(() => `idem-${++uuidCounter}`);
Object.defineProperty(globalThis, "crypto", {
  configurable: true,
  value: { ...globalThis.crypto, randomUUID },
});

const makeTx = (overrides: Partial<Transaction>): Transaction => ({
  id: "tx-1",
  tenantId: "tenant-1",
  channel: "B2C",
  direction: "OUTBOUND",
  status: "PROCESSING",
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
  ...overrides,
});

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <B2cPayoutSection />
    </QueryClientProvider>,
  );
  return {
    ...utils,
    rerenderSame: () =>
      utils.rerender(
        <QueryClientProvider client={queryClient}>
          <B2cPayoutSection />
        </QueryClientProvider>,
      ),
  };
};

const fillAndSubmit = (fields: { phone?: string; amount?: string; remarks?: string; occasion?: string }) => {
  if (fields.phone !== undefined) {
    fireEvent.change(screen.getByLabelText("Recipient Phone Number"), { target: { value: fields.phone } });
  }
  if (fields.amount !== undefined) {
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: fields.amount } });
  }
  if (fields.remarks !== undefined) {
    fireEvent.change(screen.getByLabelText("Remarks"), { target: { value: fields.remarks } });
  }
  if (fields.occasion !== undefined) {
    fireEvent.change(screen.getByLabelText("Occasion (optional)"), { target: { value: fields.occasion } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Send payout" }));
};

describe("B2cPayoutSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    uuidCounter = 0;
    randomUUID.mockClear();
    mockUsePollTransactionStatus.mockReturnValue({ data: undefined, hasStoppedPolling: false });
    mockUseBalance.mockReturnValue({ data: { availableMinorUnits: 500000 }, refetch: jest.fn() });
    mockUseTenantShortcodes.mockReturnValue({
      data: [{ id: "sc-b2c-1", type: "B2C", shortcode: "600000" }],
    });
    mockUseAuthContext.mockReturnValue({ user: { id: "u-1", roles: ["TENANT_ADMIN"] } });
  });

  // Mirrors the route's @Roles("TENANT_ADMIN") rather than replacing it — but a
  // TENANT_STAFF who can see the form only ever gets a 403, so it shouldn't render.
  it("renders nothing at all for a non-TENANT_ADMIN user", () => {
    mockUseAuthContext.mockReturnValue({ user: { id: "u-2", roles: ["TENANT_STAFF"] } });

    renderComponent();

    expect(screen.queryByText("Send a Payout")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send payout" })).not.toBeInTheDocument();
  });

  it("normalizes a 07XX phone number, converts KES to integer minor units, and draws from the tenant's only B2C shortcode", async () => {
    mockInitiateB2c.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    renderComponent();

    fillAndSubmit({ phone: "0700000000", amount: "150", remarks: "Refund for order 42" });

    await waitFor(() => expect(mockInitiateB2c).toHaveBeenCalledTimes(1));
    expect(mockInitiateB2c).toHaveBeenCalledWith(
      expect.objectContaining({
        shortcodeId: "sc-b2c-1",
        msisdn: "254700000000",
        amountMinorUnits: 15000,
        remarks: "Refund for order 42",
        occasion: undefined,
      }),
    );
  });

  // The double-disbursement guard. A failed attempt resubmitted is the SAME payout,
  // so the backend's (tenantId, idempotencyKey) constraint has to see the same key
  // and recognize a replay.
  it("reuses the same idempotency key when a failed payout is retried", async () => {
    mockInitiateB2c.mockRejectedValue(new Error("Safaricom timed out"));
    renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500", remarks: "Refund" });
    await waitFor(() => expect(mockInitiateB2c).toHaveBeenCalledTimes(1));

    fillAndSubmit({ phone: "254700000000", amount: "500", remarks: "Refund" });
    await waitFor(() => expect(mockInitiateB2c).toHaveBeenCalledTimes(2));

    const [[first], [second]] = mockInitiateB2c.mock.calls;
    expect(first.idempotencyKey).toBe(second.idempotencyKey);
    // No new key was minted, which is the whole point: the backend must see the
    // retry as a replay of one payout, not a second disbursement.
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  // ...and the other half: once an attempt actually succeeds, the next submit is a
  // genuinely new payout and must NOT be deduplicated against the previous one.
  // ...and the other half: once an attempt actually succeeds, the key must rotate, so
  // the next payout isn't deduplicated into the one that already went out.
  it("rotates the idempotency key once a payout is accepted", async () => {
    mockInitiateB2c.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500", remarks: "First payout" });
    await waitFor(() => expect(mockInitiateB2c).toHaveBeenCalledTimes(1));

    expect(mockInitiateB2c.mock.calls[0][0].idempotencyKey).toBe("idem-1");
    // Minted twice: once at mount for this payout, once after acceptance for the next.
    await waitFor(() => expect(randomUUID).toHaveBeenCalledTimes(2));
  });

  it("surfaces the backend's rejection message verbatim when the balance is too low", async () => {
    mockInitiateB2c.mockRejectedValue(new Error("Requested KES 5,000 exceeds available balance of KES 1,200"));
    renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "5000", remarks: "Refund" });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Requested KES 5,000 exceeds available balance of KES 1,200"),
    );
    expect(screen.getByText("Requested KES 5,000 exceeds available balance of KES 1,200")).toBeInTheDocument();
  });

  it("reports success only once polling reports SETTLED, never off the POST alone", async () => {
    mockInitiateB2c.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    const { rerenderSame } = renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500", remarks: "Refund" });

    await waitFor(() => expect(mockInitiateB2c).toHaveBeenCalledTimes(1));
    // Accepted into Safaricom's queue is not money delivered.
    expect(screen.queryByText("Payout sent successfully.")).not.toBeInTheDocument();

    mockUsePollTransactionStatus.mockReturnValue({ data: makeTx({ status: "SETTLED" }), hasStoppedPolling: false });
    act(() => rerenderSame());

    await waitFor(() => expect(screen.getByText("Payout sent successfully.")).toBeInTheDocument());
  });

  it("shows the failure reason once polling reports FAILED", async () => {
    mockInitiateB2c.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    const { rerenderSame } = renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500", remarks: "Refund" });
    await waitFor(() => expect(mockInitiateB2c).toHaveBeenCalledTimes(1));

    mockUsePollTransactionStatus.mockReturnValue({
      data: makeTx({ status: "FAILED", failureReason: "Recipient is not registered for M-Pesa" }),
      hasStoppedPolling: false,
    });
    act(() => rerenderSame());

    await waitFor(() => expect(screen.getByText("Recipient is not registered for M-Pesa")).toBeInTheDocument());
  });

  it("tells the merchant the funds were returned when a payout fails with no stated reason", async () => {
    mockInitiateB2c.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    const { rerenderSame } = renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500", remarks: "Refund" });
    await waitFor(() => expect(mockInitiateB2c).toHaveBeenCalledTimes(1));

    mockUsePollTransactionStatus.mockReturnValue({
      data: makeTx({ status: "FAILED", failureReason: null }),
      hasStoppedPolling: false,
    });
    act(() => rerenderSame());

    await waitFor(() =>
      expect(screen.getByText("Payout failed. The reserved funds have been returned.")).toBeInTheDocument(),
    );
  });

  // The funds are still RESERVED when polling gives up, so this must not read as
  // "nothing happened" — a merchant who resends here sends the money twice.
  it("warns against resending when polling gives up with the payout unresolved", async () => {
    mockInitiateB2c.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    const { rerenderSame } = renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500", remarks: "Refund" });
    await waitFor(() => expect(mockInitiateB2c).toHaveBeenCalledTimes(1));

    mockUsePollTransactionStatus.mockReturnValue({ data: undefined, hasStoppedPolling: true });
    act(() => rerenderSame());

    await waitFor(() => expect(screen.getByText(/do not resend/i)).toBeInTheDocument());
  });

  it("blocks submission when the tenant has no B2C-enabled shortcode", () => {
    mockUseTenantShortcodes.mockReturnValue({ data: [{ id: "sc-1", type: "PAYBILL", shortcode: "174379" }] });
    renderComponent();

    expect(screen.getByText(/No B2C-enabled shortcode is configured yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send payout" })).toBeDisabled();
  });
});
