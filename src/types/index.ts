// Previously modeled a Firestore document shape (Firestore Timestamp objects,
// status: "pending"|"success"|"failed", ad hoc fields like isTest/fee/netAmount)
// because the transactions/payments UI queried Firestore directly. The backend's
// real, current source of truth is Postgres — this now matches that shape exactly
// (see scriptpay-backend/prisma/schema.prisma Transaction model).
export type TransactionStatus = "PENDING" | "PROCESSING" | "SETTLED" | "FAILED" | "REVERSED";
export type TransactionChannel = "STK_PUSH" | "PAYBILL" | "TILL" | "B2C";

/**
 * Collections and payouts share one `transactions` table on the backend — they share
 * the ledger, reconciliation and webhook machinery, all keyed on Transaction — so
 * GET /v1/transactions returns BOTH unless `direction` is passed.
 *
 * Any figure meaning "money we took in" must filter on this. Before it existed the
 * stats cards summed every settled row, which would have counted an outgoing payout
 * as revenue.
 */
export type TransactionDirection = "INBOUND" | "OUTBOUND";

export default interface Transaction {
  id: string;
  tenantId: string;
  channel: TransactionChannel;
  direction: TransactionDirection;
  status: TransactionStatus;
  amountMinorUnits: number; // integer KES cents — divide by 100 to display
  currency: string;
  msisdn: string; // the payer on INBOUND, the payee on OUTBOUND
  merchantRequestId: string | null;
  checkoutRequestId: string | null;
  // B2C's counterparts to merchantRequestId/checkoutRequestId. Null on collections.
  originatorConversationId: string | null;
  conversationId: string | null;
  mpesaReceiptNumber: string | null;
  failureReason: string | null;
  payoutRemarks: string | null;
  payoutOccasion: string | null;
  createdAt: string; // ISO string, not a Firestore Timestamp
  updatedAt: string;
}

/** True when this row is money leaving the tenant's balance rather than entering it. */
export function isPayout(transaction: Pick<Transaction, "direction">): boolean {
  return transaction.direction === "OUTBOUND";
}

export function formatKes(amountMinorUnits: number): string {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amountMinorUnits / 100);
}
