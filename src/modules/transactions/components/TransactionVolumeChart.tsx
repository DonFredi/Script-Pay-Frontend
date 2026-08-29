"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type Transaction from "@/types";

const DAYS = 14;

const chartConfig = {
  settled: { label: "Settled", color: "var(--chart-1)" },
  other: { label: "Pending / Failed", color: "var(--chart-3)" },
} satisfies ChartConfig;

// Collections only — same reasoning TransactionStatsCards documents: a settled
// payout landing in the same "settled" count as a settled collection would move
// this chart for a reason that has nothing to do with money coming in, and there
// would be no way to tell which happened from the chart alone.
function buildDailySeries(transactions: Transaction[]) {
  const buckets = new Map<string, { date: string; settled: number; other: number }>();
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, settled: 0, other: 0 });
  }
  for (const t of transactions) {
    if (t.direction === "OUTBOUND") continue;
    const bucket = buckets.get(t.createdAt.slice(0, 10));
    if (!bucket) continue;
    if (t.status === "SETTLED") bucket.settled += 1;
    else bucket.other += 1;
  }
  return Array.from(buckets.values());
}

/**
 * Adapted from shadcn's dashboard-01 block (`ChartAreaInteractive`) — that
 * version plotted fake "desktop/mobile visitor" data with a time-range picker.
 * This plots real daily transaction counts (settled vs. everything else) for
 * whatever transaction list the page already fetched, over the trailing 14 days.
 */
export function TransactionVolumeChart({ transactions }: { transactions: Transaction[] }) {
  const data = React.useMemo(() => buildDailySeries(transactions), [transactions]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
        <CardDescription>Daily collections received, last {DAYS} days</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillSettled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-settled)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-settled)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillOther" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-other)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-other)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(String(value)).toLocaleDateString("en-KE", { month: "short", day: "numeric" })
                  }
                  indicator="dot"
                />
              }
            />
            <Area dataKey="other" type="natural" fill="url(#fillOther)" stroke="var(--color-other)" stackId="a" />
            <Area dataKey="settled" type="natural" fill="url(#fillSettled)" stroke="var(--color-settled)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
