import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type Transaction from "@/types";
import { formatKes } from "@/types";

/**
 * Adapted from shadcn's dashboard-01 block (`SectionCards`) — that version
 * showed hardcoded "Total Revenue"/"New Customers" placeholder numbers with
 * nothing wired up. This computes real stats from the transactions already
 * fetched for the page (no dedicated backend stats endpoint exists yet).
 */
export function TransactionStatsCards({ transactions, loading }: { transactions: Transaction[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const total = transactions.length;
  const settled = transactions.filter((t) => t.status === "SETTLED");
  const pending = transactions.filter((t) => t.status === "PENDING" || t.status === "PROCESSING");
  const failed = transactions.filter((t) => t.status === "FAILED" || t.status === "REVERSED");
  const totalVolume = settled.reduce((sum, t) => sum + t.amountMinorUnits, 0);
  const successRate = total ? Math.round((settled.length / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Transactions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{total}</CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">All statuses combined</CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Volume (Settled)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatKes(totalVolume)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">{settled.length} settled payments</CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Success Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{successRate}%</CardTitle>
          <CardAction>
            <Badge variant="outline">
              {successRate >= 50 ? <IconTrendingUp /> : <IconTrendingDown />}
              {settled.length}/{total}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">Settled vs. total</CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pending.length}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">{failed.length} failed / reversed</CardFooter>
      </Card>
    </div>
  );
}
