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

  // Everything below is COLLECTIONS ONLY. GET /v1/transactions returns payouts in
  // the same list (both directions share one table server-side), and this component
  // used to reduce over all of it — so a settled B2C payout was added to "Total
  // Volume" and presented as revenue, and dragged the success rate around with it.
  // Money out is reported separately in its own card rather than netted off, since
  // "we collected 100k" and "we collected 100k and disbursed 30k" are different
  // facts and averaging them tells you neither.
  const collections = transactions.filter((t) => t.direction === "INBOUND");
  const payouts = transactions.filter((t) => t.direction === "OUTBOUND");

  const total = collections.length;
  const settled = collections.filter((t) => t.status === "SETTLED");
  const pending = collections.filter((t) => t.status === "PENDING" || t.status === "PROCESSING");
  const failed = collections.filter((t) => t.status === "FAILED" || t.status === "REVERSED");
  const totalVolume = settled.reduce((sum, t) => sum + t.amountMinorUnits, 0);
  const successRate = total ? Math.round((settled.length / total) * 100) : 0;

  const settledPayouts = payouts.filter((t) => t.status === "SETTLED");
  const payoutVolume = settledPayouts.reduce((sum, t) => sum + t.amountMinorUnits, 0);
  // Reserved but not yet confirmed by Safaricom — the tenant cannot spend these.
  const pendingPayouts = payouts.filter((t) => t.status === "PENDING" || t.status === "PROCESSING");

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
      {/* Only rendered once a tenant actually has payouts, so nothing changes on
          screen for the collections-only merchants who are the common case. */}
      {payouts.length > 0 && (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Paid Out (Settled)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatKes(payoutVolume)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            {settledPayouts.length} sent
            {pendingPayouts.length > 0 && ` · ${pendingPayouts.length} in flight`}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
