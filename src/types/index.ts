// Previously modeled a Firestore document shape (Firestore Timestamp objects,
// status: "pending"|"success"|"failed", ad hoc fields like isTest/fee/netAmount)
// because the transactions/payments UI queried Firestore directly. The backend's
// real, current source of truth is Postgres — this now matches that shape exactly
// (see scriptpay-backend/prisma/schema.prisma Transaction model).
export type TransactionStatus = "PENDING" | "PROCESSING" | "SETTLED" | "FAILED" | "REVERSED";
export type TransactionChannel = "STK_PUSH" | "PAYBILL" | "TILL";

export default interface Transaction {
  id: string;
  tenantId: string;
  channel: TransactionChannel;
  status: TransactionStatus;
  amountMinorUnits: number; // integer KES cents — divide by 100 to display
  currency: string;
  msisdn: string;
  merchantRequestId: string | null;
  checkoutRequestId: string | null;
  mpesaReceiptNumber: string | null;
  failureReason: string | null;
  createdAt: string; // ISO string, not a Firestore Timestamp
  updatedAt: string;
}

export function formatKes(amountMinorUnits: number): string {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amountMinorUnits / 100);
}
