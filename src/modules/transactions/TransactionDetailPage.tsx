"use client";

import Link from "next/link";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { Button } from "@/shared/components/ui/button";
import { formatKes, type TransactionStatus } from "@/types";
import { useTransaction } from "./useTransactions";
import { useTenant } from "@/modules/admin/useTenants";

const STATUS_STYLES: Record<TransactionStatus, string> = {
  SETTLED: "text-green-600 font-medium",
  FAILED: "text-red-600 font-medium",
  REVERSED: "text-red-600 font-medium",
  PENDING: "text-yellow-600 font-medium",
  PROCESSING: "text-yellow-600 font-medium",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-KE");
}

/**
 * Placeholder logo marks — swap each `<span>` for an `<img>`/`<svg>` once the
 * official ScriptPay and ScriptTagg logo assets exist. This replaces the
 * website nav (hidden on print via SiteHeader/Sidebar's `print:hidden`) as
 * the heading a printed receipt actually shows.
 */
function ReceiptLetterhead() {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3">
      <div className="flex h-10 w-28 items-center justify-center rounded border border-dashed text-[10px] font-medium text-muted-foreground">
        <span>ScriptPay logo</span>
      </div>
      <div className="flex h-10 w-28 items-center justify-center rounded border border-dashed text-[10px] font-medium text-muted-foreground">
        <span>ScriptTagg logo</span>
      </div>
    </div>
  );
}

/**
 * A payout reuses this page, so every piece of copy that assumed money coming IN
 * has to swap. Rendering "PAID / Paid by / M-Pesa B2C" over a disbursement would
 * read as a customer payment that never happened.
 */
function channelLabel(channel: string): string {
  if (channel === "STK_PUSH") return "M-Pesa STK Push";
  if (channel === "B2C") return "M-Pesa payout to customer";
  return `M-Pesa ${channel}`;
}

/**
 * Shared between the tenant's own transaction detail route ((client)/transactions/[id])
 * and the admin oversight one (admin/transactions/[id]) — GET /v1/transactions/:id
 * already scopes by caller (own tenant, or unrestricted for SUPER_ADMIN), so one
 * component and one query cover both; only the "back" destination differs.
 */
export function TransactionDetailPage({ transactionId, backHref }: { transactionId: string; backHref: string }) {
  const { data: transaction, isLoading, error } = useTransaction(transactionId);
  // GET /v1/tenants/:id has no @Roles() restriction — a tenant caller viewing their
  // own tenantId is allowed, and SUPER_ADMIN can view any — so this resolves the
  // business name on the receipt correctly in both the tenant and admin contexts.
  const { data: tenant } = useTenant(transaction?.tenantId ?? "");

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div className="print:hidden">
          <Link href={backHref} className="text-sm text-muted-foreground underline">
            ← Transactions
          </Link>
          <PageHeading>{isLoading ? "Transaction" : `Transaction — ${transactionId.slice(0, 10)}…`}</PageHeading>
        </div>

        {isLoading && <P className="text-muted-foreground">Loading…</P>}
        {error && <P className="text-destructive">Could not load this transaction.</P>}

        {transaction && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {transaction.status === "SETTLED" && (
              <div
                id="receipt"
                className="w-full shrink-0 rounded-lg border bg-card p-6 print:mx-auto print:w-full print:max-w-lg print:border-none lg:max-w-sm"
              >
                <ReceiptLetterhead />
                <div className="flex items-center justify-between">
                  <P className="font-semibold">{tenant?.name ?? "Receipt"}</P>
                  <span
                    className={
                      transaction.direction === "OUTBOUND"
                        ? "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                        : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                    }
                  >
                    {transaction.direction === "OUTBOUND" ? "SENT" : "PAID"}
                  </span>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Receipt No.</dt>
                    <dd className="font-mono">{transaction.mpesaReceiptNumber ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      {transaction.direction === "OUTBOUND" ? "Amount Sent" : "Amount Paid"}
                    </dt>
                    <dd className="font-medium">{formatKes(transaction.amountMinorUnits)}</dd>
                  </div>
                  <div className="flex justify-between">
                    {/* msisdn is the payer on a collection and the payee on a payout —
                        the same field means opposite people depending on direction. */}
                    <dt className="text-muted-foreground">
                      {transaction.direction === "OUTBOUND" ? "Paid to" : "Paid by"}
                    </dt>
                    <dd>{transaction.msisdn}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Payment method</dt>
                    <dd>{channelLabel(transaction.channel)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd>{formatDate(transaction.updatedAt)}</dd>
                  </div>
                </dl>
                <Button variant="outline" className="mt-4 w-full print:hidden" onClick={() => window.print()}>
                  Print receipt
                </Button>
              </div>
            )}

            <dl className="grid flex-1 grid-cols-1 gap-x-8 gap-y-4 rounded-lg border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className={STATUS_STYLES[transaction.status]}>{transaction.status}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Amount</dt>
                <dd className="font-medium">{formatKes(transaction.amountMinorUnits)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Direction</dt>
                <dd className="font-medium">
                  {transaction.direction === "OUTBOUND" ? "Payout (money out)" : "Collection (money in)"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {transaction.direction === "OUTBOUND" ? "Recipient" : "Phone number"}
                </dt>
                <dd>{transaction.msisdn}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Channel</dt>
                <dd>{transaction.channel}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">M-Pesa receipt</dt>
                <dd className="font-mono">{transaction.mpesaReceiptNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Currency</dt>
                <dd>{transaction.currency}</dd>
              </div>
              {transaction.direction === "OUTBOUND" ? (
                <>
                  <div>
                    <dt className="text-xs text-muted-foreground">Originator conversation ID</dt>
                    <dd className="font-mono text-xs break-all">{transaction.originatorConversationId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Conversation ID</dt>
                    <dd className="font-mono text-xs break-all">{transaction.conversationId ?? "—"}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt className="text-xs text-muted-foreground">Merchant request ID</dt>
                    <dd className="font-mono text-xs break-all">{transaction.merchantRequestId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Checkout request ID</dt>
                    <dd className="font-mono text-xs break-all">{transaction.checkoutRequestId ?? "—"}</dd>
                  </div>
                </>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd>{formatDate(transaction.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Updated</dt>
                <dd>{formatDate(transaction.updatedAt)}</dd>
              </div>
              {transaction.direction === "OUTBOUND" && transaction.payoutRemarks && (
                <div>
                  <dt className="text-xs text-muted-foreground">Remarks</dt>
                  <dd>{transaction.payoutRemarks}</dd>
                </div>
              )}
              {transaction.direction === "OUTBOUND" && transaction.payoutOccasion && (
                <div>
                  <dt className="text-xs text-muted-foreground">Occasion</dt>
                  <dd>{transaction.payoutOccasion}</dd>
                </div>
              )}
              {transaction.failureReason && (
                <div className="col-span-full">
                  <dt className="text-xs text-muted-foreground">Failure reason</dt>
                  <dd className="text-destructive">{transaction.failureReason}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
