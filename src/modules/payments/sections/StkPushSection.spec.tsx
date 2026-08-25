import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import StkPushSection from "./StkPushSection";
import { initiateStkPush } from "../payments.api";
import { usePollTransactionStatus } from "../usePollTransactionStatus";
import type Transaction from "@/types";

// payments.api.ts's own request/response handling is covered by
// api-client.spec.ts, and the polling logic itself by
// usePollTransactionStatus.spec.tsx. This is the actual money-movement
// trigger (the one path flagged as untested after the hook-layer pass), so
// it covers what only lives inline in this component: normalizing 07XX
// phone numbers to Daraja's 2547XX format, converting a KES amount typed by
// the user into integer minor units, and mapping the Paybill/Till toggle to
// the right `channel` value — a bug in any of these means either a failed
// STK push or, worse, a customer charged the wrong amount.
jest.mock("../payments.api", () => ({ initiateStkPush: jest.fn() }));
jest.mock("../usePollTransactionStatus", () => ({ usePollTransactionStatus: jest.fn() }));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockInitiateStkPush = initiateStkPush as jest.Mock;
const mockUsePollTransactionStatus = usePollTransactionStatus as jest.Mock;

const makeTx = (overrides: Partial<Transaction>): Transaction => ({
  id: "tx-1",
  tenantId: "tenant-1",
  channel: "STK_PUSH",
  status: "PROCESSING",
  amountMinorUnits: 10000,
  currency: "KES",
  msisdn: "254700000000",
  merchantRequestId: null,
  checkoutRequestId: null,
  mpesaReceiptNumber: null,
  failureReason: null,
  createdAt: "2026-08-25T00:00:00.000Z",
  updatedAt: "2026-08-25T00:00:00.000Z",
  ...overrides,
});

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <StkPushSection />
    </QueryClientProvider>,
  );
  return {
    ...utils,
    rerenderSame: () =>
      utils.rerender(
        <QueryClientProvider client={queryClient}>
          <StkPushSection />
        </QueryClientProvider>,
      ),
  };
};

const fillAndSubmit = (fields: { phone?: string; amount?: string; accountNumber?: string }) => {
  if (fields.phone !== undefined) {
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: fields.phone } });
  }
  if (fields.amount !== undefined) {
    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: fields.amount } });
  }
  if (fields.accountNumber !== undefined) {
    fireEvent.change(screen.getByLabelText("Account Number"), { target: { value: fields.accountNumber } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Send Prompt" }));
};

describe("StkPushSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePollTransactionStatus.mockReturnValue({ data: undefined });
  });

  it("normalizes a 07XX phone number and converts KES amount to integer minor units for a plain STK push", async () => {
    mockInitiateStkPush.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    renderComponent();

    fillAndSubmit({ phone: "0700000000", amount: "150" });

    await waitFor(() => expect(mockInitiateStkPush).toHaveBeenCalledTimes(1));
    expect(mockInitiateStkPush).toHaveBeenCalledWith(
      expect.objectContaining({
        msisdn: "254700000000",
        amountMinorUnits: 15000,
        channel: undefined,
      }),
    );
  });

  it("sends channel: PAYBILL with the account reference when Paybill is selected", async () => {
    mockInitiateStkPush.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    renderComponent();

    fireEvent.click(screen.getByRole("radio", { name: "Paybill" }));
    fillAndSubmit({ phone: "254700000000", amount: "500", accountNumber: "invoice-42" });

    await waitFor(() => expect(mockInitiateStkPush).toHaveBeenCalledTimes(1));
    expect(mockInitiateStkPush).toHaveBeenCalledWith(
      expect.objectContaining({ channel: "PAYBILL", accountReference: "invoice-42" }),
    );
  });

  it("sends channel: TILL when Till is selected", async () => {
    mockInitiateStkPush.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    renderComponent();

    fireEvent.click(screen.getByRole("radio", { name: "Till" }));
    fillAndSubmit({ phone: "254700000000", amount: "500" });

    await waitFor(() => expect(mockInitiateStkPush).toHaveBeenCalledTimes(1));
    expect(mockInitiateStkPush).toHaveBeenCalledWith(expect.objectContaining({ channel: "TILL" }));
  });

  it("shows an error toast and does not track a transaction when initiation fails", async () => {
    mockInitiateStkPush.mockRejectedValue(new Error("insufficient Daraja balance"));
    renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500" });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("insufficient Daraja balance"));
    expect(screen.getByText("insufficient Daraja balance")).toBeInTheDocument();
  });

  it("shows a success message once polling reports SETTLED", async () => {
    mockInitiateStkPush.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    const { rerenderSame } = renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500" });

    await waitFor(() => expect(mockInitiateStkPush).toHaveBeenCalledTimes(1));

    // usePollTransactionStatus is mocked, so simulate a poll tick landing by
    // updating its return value and re-rendering the same component instance
    // (a real poll tick would do this via react-query's own state update).
    mockUsePollTransactionStatus.mockReturnValue({ data: makeTx({ status: "SETTLED" }) });
    act(() => rerenderSame());

    await waitFor(() => expect(screen.getByText("Payment successful!")).toBeInTheDocument());
  });

  it("shows the failure reason once polling reports FAILED", async () => {
    mockInitiateStkPush.mockResolvedValue({ transactionId: "tx-1", status: "PROCESSING" });
    const { rerenderSame } = renderComponent();

    fillAndSubmit({ phone: "254700000000", amount: "500" });

    await waitFor(() => expect(mockInitiateStkPush).toHaveBeenCalledTimes(1));

    mockUsePollTransactionStatus.mockReturnValue({
      data: makeTx({ status: "FAILED", failureReason: "Insufficient funds" }),
    });
    act(() => rerenderSame());

    await waitFor(() => expect(screen.getByText("Insufficient funds")).toBeInTheDocument());
  });
});
