import { render, screen } from "@testing-library/react";
import { TransactionStatsCards } from "./TransactionStatsCards";
import type Transaction from "@/types";
/**
 * Amounts are asserted on the numeric part only. Intl renders KES as "Ksh" and
 * separates it with a non-breaking space whose exact codepoint varies by ICU build,
 * so matching the full formatted string fails for reasons that have nothing to do
 * with this component. getAllByText is used over getByText because an ancestor card
 * also contains the figure, and a single-match query would throw on that.
 */
const shows = (amount: string) => screen.getAllByText(new RegExp(amount.replace(".", "\\."))).length > 0;
const hidden = (amount: string) => screen.queryAllByText(new RegExp(amount.replace(".", "\\."))).length === 0;

// GET /v1/transactions returns collections AND payouts in one list (they share a
// table server-side). This component used to reduce over all of it, so a settled
// payout was added to "Total Volume" and reported as revenue, and moved the success
// rate around with it. These tests pin the separation.
const makeTx = (overrides: Partial<Transaction>): Transaction => ({
  id: "tx-1",
  tenantId: "tenant-1",
  channel: "STK_PUSH",
  direction: "INBOUND",
  status: "SETTLED",
  amountMinorUnits: 10_000_00,
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
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
  ...overrides,
});

const collection = (overrides: Partial<Transaction> = {}) => makeTx({ direction: "INBOUND", ...overrides });
const payout = (overrides: Partial<Transaction> = {}) =>
  makeTx({ direction: "OUTBOUND", channel: "B2C", ...overrides });

describe("TransactionStatsCards", () => {
  it("excludes settled payouts from collected volume", () => {
    render(
      <TransactionStatsCards
        transactions={[
          collection({ id: "c1", amountMinorUnits: 10_000_00 }),
          payout({ id: "p1", amountMinorUnits: 7_000_00 }),
        ]}
      />,
    );

    // 10,000 collected — NOT 17,000. The payout is money leaving.
    expect(shows("10,000.00")).toBe(true);
    expect(hidden("17,000.00")).toBe(true);
  });

  it("reports payout volume separately rather than netting it off", () => {
    render(
      <TransactionStatsCards
        transactions={[
          collection({ id: "c1", amountMinorUnits: 10_000_00 }),
          payout({ id: "p1", amountMinorUnits: 7_000_00 }),
        ]}
      />,
    );

    expect(screen.getByText("Paid Out (Settled)")).toBeInTheDocument();
    expect(shows("7,000.00")).toBe(true);
    // Not netted to 3,000 — "collected 10k" and "collected 10k, sent 7k" are
    // different facts and one number cannot carry both.
    expect(hidden("3,000.00")).toBe(true);
  });

  it("keeps a failed payout out of the collection success rate", () => {
    render(
      <TransactionStatsCards
        transactions={[
          collection({ id: "c1", status: "SETTLED" }),
          collection({ id: "c2", status: "SETTLED" }),
          payout({ id: "p1", status: "FAILED" }),
        ]}
      />,
    );

    // Both collections settled: 100%, despite the failed payout in the same list.
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("counts only collections in the total", () => {
    render(
      <TransactionStatsCards transactions={[collection({ id: "c1" }), payout({ id: "p1" }), payout({ id: "p2" })]} />,
    );

    expect(screen.getByText("Total Transactions")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  // The common case is a merchant who only collects; nothing should change for them.
  it("hides the payout card entirely when there are no payouts", () => {
    render(<TransactionStatsCards transactions={[collection({ id: "c1" })]} />);

    expect(screen.queryByText("Paid Out (Settled)")).not.toBeInTheDocument();
  });

  it("surfaces in-flight payouts, whose funds are reserved and unspendable", () => {
    render(
      <TransactionStatsCards
        transactions={[
          collection({ id: "c1" }),
          payout({ id: "p1", status: "SETTLED", amountMinorUnits: 1_000_00 }),
          payout({ id: "p2", status: "PROCESSING" }),
        ]}
      />,
    );

    expect(screen.getByText(/1 sent/)).toBeInTheDocument();
    expect(screen.getByText(/1 in flight/)).toBeInTheDocument();
  });
});
