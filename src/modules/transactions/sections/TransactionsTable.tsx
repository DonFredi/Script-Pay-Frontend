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

  return (
    <SectionWrapper>
      <Table>
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
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </SectionWrapper>
  );
};
export default TransactionsTable;
