"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { formatISODateDisplay } from "@/lib/date";
import type {
  ReceivablesAgingBucket,
  ReceivablesAgingData,
  ReceivablesAgingLine,
} from "@/types/report";
import Link from "next/link";

const BUCKET_LABEL: Record<ReceivablesAgingBucket, string> = {
  CURRENT: "Current",
  DAYS_1_30: "1–30 days",
  DAYS_31_60: "31–60 days",
  DAYS_61_90: "61–90 days",
  DAYS_91_PLUS: "91+ days",
};

const BUCKET_CHIPS: { id: ReceivablesAgingBucket | "ALL"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "CURRENT", label: "Current" },
  { id: "DAYS_1_30", label: "1–30" },
  { id: "DAYS_31_60", label: "31–60" },
  { id: "DAYS_61_90", label: "61–90" },
  { id: "DAYS_91_PLUS", label: "91+" },
];

function moneyToNumber(s: string): number {
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function ReceivablesAgingSection({ data }: { data: ReceivablesAgingData }) {
  const [bucketFilter, setBucketFilter] = useState<ReceivablesAgingBucket | "ALL">("ALL");

  const chartRows = useMemo(
    () => [
      {
        name: "Current",
        amount: moneyToNumber(data.summary.current),
      },
      {
        name: "1–30",
        amount: moneyToNumber(data.summary.days1to30),
      },
      {
        name: "31–60",
        amount: moneyToNumber(data.summary.days31to60),
      },
      {
        name: "61–90",
        amount: moneyToNumber(data.summary.days61to90),
      },
      {
        name: "91+",
        amount: moneyToNumber(data.summary.days91plus),
      },
    ],
    [data.summary],
  );

  const filteredLines = useMemo(() => {
    if (bucketFilter === "ALL") return data.lines;
    return data.lines.filter((l) => l.agingBucket === bucketFilter);
  }, [data.lines, bucketFilter]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Report as of{" "}
        <span className="font-medium text-foreground">{formatISODateDisplay(data.asOf)}</span>
        {" · "}
        Total due{" "}
        <span className="font-medium text-foreground">{formatCurrency(data.summary.totalDue)}</span>
      </p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aging by bucket</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ChartContainer config={{}} className="h-[220px] w-full">
            <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tickLine={false} className="text-xs" />
              <YAxis
                tickLine={false}
                tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => String(label)}
                  />
                }
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {BUCKET_CHIPS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setBucketFilter(c.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              bucketFilter === c.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="data-table-container overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Invoice</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Party</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Bucket</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Due</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                Days past due
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Due date</th>
            </tr>
          </thead>
          <tbody>
            {filteredLines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No lines in this bucket.
                </td>
              </tr>
            ) : (
              filteredLines.map((line, idx) => (
                <AgingRow key={`${line.invoiceId}-${idx}`} line={line} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgingRow({ line }: { line: ReceivablesAgingLine }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/20">
      <td className="px-3 py-2">
        <Link
          href={`/invoices/${line.invoiceId}`}
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          {line.invoiceNumber}
        </Link>
        <span className="ml-2 text-xs text-muted-foreground">{line.invoiceType}</span>
      </td>
      <td className="px-3 py-2">{line.partyName}</td>
      <td className="px-3 py-2">
        <Badge variant="outline" className="font-normal">
          {BUCKET_LABEL[line.agingBucket]}
        </Badge>
      </td>
      <td className="px-3 py-2 text-right font-medium tabular-nums">
        {formatCurrency(line.dueAmount)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
        {line.daysPastDue}
      </td>
      <td className="px-3 py-2 text-muted-foreground">
        {line.dueDate ? formatDate(line.dueDate) : formatDate(line.invoiceDate)}
      </td>
    </tr>
  );
}
