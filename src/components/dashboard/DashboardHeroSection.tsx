import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { partyLedgerBalanceInlineParts } from "@/lib/party/party-ledger-display";
import { cn, formatCurrency } from "@/lib/core/utils";
import type { DashboardData } from "@/types/dashboard";

interface DashboardHeroSectionProps {
  greeting: string;
  dashboard: DashboardData;
  canCreateInvoice?: boolean;
}

function toNumber(v: string | number | undefined | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function computeRevenueTrend(months: DashboardData["revenueByMonth"]): "up" | "down" | undefined {
  const arr = months ?? [];
  if (arr.length < 2) return undefined;
  const last = arr[arr.length - 1];
  const prior = arr[arr.length - 2];
  if (last == null || prior == null) return undefined;
  const latest = toNumber(last.revenue);
  const previous = toNumber(prior.revenue);
  if (latest === previous) return undefined;
  return latest > previous ? "up" : "down";
}

function netOutstandingAmount(d: DashboardData): number {
  return toNumber(d.netOutstanding ?? d.totalOutstanding);
}

const OUTSTANDING_EPS = 1e-6;

function netOutstandingValueDisplay(outstanding: number): ReactNode {
  if (Math.abs(outstanding) < OUTSTANDING_EPS) {
    return formatCurrency(0);
  }
  const { amountStr, label, labelClassName } = partyLedgerBalanceInlineParts(String(outstanding));
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span>{amountStr}</span>
      <span className={labelClassName}>{label}</span>
    </span>
  );
}

function KpiTile({
  label,
  value,
  subtitle,
  trend,
}: {
  label: string;
  value: ReactNode;
  subtitle?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <div className="text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
          {value}
        </div>
        {trend ? (
          <span
            className={cn(
              "text-[11px] font-medium",
              trend === "up" ? "text-status-paid" : "text-status-overdue",
            )}
          >
            {trend === "up" ? "Trend ↑" : "Trend ↓"}
          </span>
        ) : null}
      </div>
      {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function DashboardHeroSection({
  greeting,
  dashboard,
  canCreateInvoice = true,
}: DashboardHeroSectionProps) {
  const allowNewSaleInvoice = canCreateInvoice === true;
  const netRevenue = toNumber(dashboard.totalRevenueNet ?? dashboard.totalRevenue);
  const ledgerPaid = toNumber(dashboard.totalPaidFromLedger ?? dashboard.totalPaid);
  const outstanding = netOutstandingAmount(dashboard);
  const months = dashboard.revenueByMonth ?? [];
  const lastMonth = months.length > 0 ? months[months.length - 1] : null;
  const latestMonthRevenue = lastMonth ? toNumber(lastMonth.revenue) : 0;
  const latestMonthLabel = lastMonth?.month?.trim() ? lastMonth.month : "Latest period";

  const asOf = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            As of {asOf}
          </span>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            {allowNewSaleInvoice ? (
              <Button asChild size="sm" className="rounded-md">
                <Link href="/invoices/new?type=SALE_INVOICE">+ New sales invoice</Link>
              </Button>
            ) : (
              <Button type="button" size="sm" className="rounded-md" disabled>
                + New sales invoice
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-md" asChild>
              <Link href="/invoices/purchases">Purchases</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-md" asChild>
              <Link href="/reports">Reports</Link>
            </Button>
          </div>
          {!allowNewSaleInvoice ? (
            <p className="max-w-[260px] text-right text-[11px] text-muted-foreground">
              Finish your profile or renew access.{" "}
              <Link
                href="/profile"
                className="font-medium text-primary underline underline-offset-2"
              >
                Profile
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Net sales revenue"
          value={formatCurrency(netRevenue)}
          subtitle="After returns, sale side"
        />
        <KpiTile
          label="Latest month in trend"
          value={months.length ? formatCurrency(latestMonthRevenue) : "—"}
          subtitle={months.length ? latestMonthLabel : "Add invoices to see the chart"}
          trend={months.length >= 2 ? computeRevenueTrend(months) : undefined}
        />
        <KpiTile
          label="Net customer balance"
          value={netOutstandingValueDisplay(outstanding)}
          subtitle={
            outstanding < 0
              ? "Credit with customers"
              : outstanding > 0
                ? "Still to collect (net)"
                : "Balanced"
          }
        />
        <KpiTile
          label="Payments recorded"
          value={formatCurrency(ledgerPaid)}
          subtitle="Receipts & credits in ledger"
        />
      </div>
    </section>
  );
}
