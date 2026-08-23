"use client";
import Link from "next/link";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import type Transaction from "@/types";
import { formatKes } from "@/types";

interface TransactionsTableProps {
  transactions: Transaction[];
  loading: boolean;
  // Where a row's detail link points — this table is shared between the tenant's
  // own /transactions page and the admin oversight /admin/transactions page, and
  // each needs its own route prefix.
  detailBasePath?: string;
}

// Previously formatted a Firestore Timestamp (`.toDate()`) — the backend returns
// a plain ISO string, so this is just a standard Date parse now.
const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("en-KE");
};

const getStatusStyle = (status: Transaction["status"]) => {
  switch (status) {
    case "SETTLED":
      return "text-green-600 font-medium";
    case "FAILED":
    case "REVERSED":
      return "text-red-600 font-medium";
    default: // PENDING, PROCESSING
      return "text-yellow-600 font-medium";
  }
};

const TransactionsTable = ({ transactions, loading, detailBasePath = "/transactions" }: TransactionsTableProps) => {
  if (loading) {
    return <div>Loading Transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <SectionWrapper>
        <p className="py-8 text-center text-muted-foreground">No transactions found.</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      {/* Below md, a 6-column whitespace-nowrap table is wider than the
          viewport, so the table-container's overflow-x-auto turns every row
          into a horizontal-scroll surface. On a real touchscreen, a tap with
          any sideways finger drift gets captured as that scroll gesture and
          the browser cancels the click — the row never navigates, even though
          the exact same tap works fine with a mouse (DevTools/local testing
          never triggers this touch-cancel path). A stacked card list has no
          competing scroll surface, so this doesn't come up. */}
      <div className="flex flex-col gap-3 md:hidden">
        {transactions.map((transaction) => (
          <Link
            key={transaction.id}
            href={`${detailBasePath}/${transaction.id}`}
            className="block rounded-lg border bg-card p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-medium">{transaction.id.slice(0, 10)}...</span>
              <span className={getStatusStyle(transaction.status)}>{transaction.status}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>{transaction.msisdn}</span>
              <span className="font-medium text-foreground">{formatKes(transaction.amountMinorUnits)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{transaction.mpesaReceiptNumber ?? "—"}</span>
              <span>{formatDate(transaction.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>

      <Table className="hidden md:table">
        <TableCaption>A list of your recent transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">ID</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="relative">
              <TableCell className="font-medium">
                <Link
                  href={`${detailBasePath}/${transaction.id}`}
                  className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {transaction.id.slice(0, 10)}...
                </Link>
              </TableCell>
              <TableCell>{transaction.msisdn}</TableCell>
              <TableCell>{formatKes(transaction.amountMinorUnits)}</TableCell>
              <TableCell>{transaction.mpesaReceiptNumber ?? "—"}</TableCell>
              <TableCell className={getStatusStyle(transaction.status)}>{transaction.status}</TableCell>
              <TableCell className="text-right">{formatDate(transaction.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionWrapper>
  );
};
export default TransactionsTable;
