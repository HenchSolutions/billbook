"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { DashboardCustomRangePopover } from "@/components/dashboard/DashboardCustomRangePopover";
import type { DashboardCustomRangeFields } from "@/components/dashboard/DashboardCustomRangePopover";
import { cn, formatCurrency, formatDate } from "@/lib/core/utils";
import type { DashboardData, DashboardPeriodMode } from "@/types/dashboard";
import {
  buildSalesPurchaseChartData,
  dashboardChartScopeFootnote,
} from "@/lib/business/dashboard-home";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { useResolvedCssHsl } from "@/hooks/use-resolved-css-hsl";
import { usePermissions } from "@/hooks/use-permissions";
import { PAGE } from "@/constants/page-access";
import { MAX_REPORT_DATE_RANGE_MONTHS } from "@/constants";

interface DashboardHomeSalesPurchaseChartProps {
  dashboard: DashboardData;
  /** Matches Performance snapshot chips. */
  periodMode: DashboardPeriodMode;
  customRange: DashboardCustomRangeFields;
  onPeriodModeChange: (mode: DashboardPeriodMode) => void;
}

function chartPeriodBadgeLabel(periodMode: DashboardPeriodMode, dashboard: DashboardData): string {
  if (periodMode === "overall") return "All time";
  if (periodMode === "monthly") return "This month";
  if (dashboard.periodStart && dashboard.periodEnd) {
    return `${formatDate(dashboard.periodStart)} – ${formatDate(dashboard.periodEnd)}`;
  }
  return "Custom range";
}

const PLACEHOLDER = [{ month: "—", sales: 0, purchase: 0 }];

type ChartRow = { month: string; sales: number; purchase: number };

function SalesPurchaseTooltip({
  active,
  payload,
  label,
  showPurchaseSeries,
  purchaseEstimated,
  salesColor,
  purchaseColor,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  label?: string | number;
  showPurchaseSeries: boolean;
  purchaseEstimated: boolean;
  salesColor: string;
  purchaseColor: string;
}) {
  if (!active || !payload?.length) return null;
  const raw = payload[0]?.payload;
  const row = raw && typeof raw === "object" ? (raw as ChartRow) : undefined;
  if (!row || row.month === "—") return null;

  const sales = Number(row.sales) || 0;
  const purchase = Number(row.purchase) || 0;
  const monthLabel = typeof label === "string" && label.trim() ? label : row.month;
  const net = sales - purchase;

  return (
    <div
      className={cn(
        "min-w-[200px] rounded-lg border border-border/60 bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-xl",
        "duration-150 animate-in fade-in-0 zoom-in-95",
      )}
    >
      <p className="border-b border-border/50 pb-2 font-semibold text-foreground">{monthLabel}</p>
      <dl className="mt-2 space-y-2">
        <div className="flex items-center justify-between gap-6">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: salesColor }}
              aria-hidden
            />
            Sales
          </dt>
          <dd className="font-semibold tabular-nums text-foreground">{formatCurrency(sales)}</dd>
        </div>
        {showPurchaseSeries ? (
          <div className="flex items-center justify-between gap-6">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: purchaseColor }}
                aria-hidden
              />
              Purchase
            </dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {formatCurrency(purchase)}
            </dd>
          </div>
        ) : purchaseEstimated ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            Purchase for this month is not included yet — only sales are shown in the chart.
          </p>
        ) : null}
        {showPurchaseSeries ? (
          <div className="flex items-center justify-between gap-6 border-t border-border/40 pt-2">
            <dt className="text-muted-foreground">Net (sales − purchase)</dt>
            <dd
              className={cn(
                "font-semibold tabular-nums",
                net >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {formatCurrency(net)}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export function DashboardHomeSalesPurchaseChart({
  dashboard,
  periodMode,
  customRange,
  onPeriodModeChange,
}: DashboardHomeSalesPurchaseChartProps) {
  const [chartRangePopoverOpen, setChartRangePopoverOpen] = useState(false);

  useEffect(() => {
    if (periodMode !== "custom") setChartRangePopoverOpen(false);
  }, [periodMode]);

  const { can } = usePermissions();
  const canReports = can(PAGE.reports);
  const salesColor = useResolvedCssHsl("--chart-1");
  const purchaseColor = useResolvedCssHsl("--chart-3");
  const { rows, purchaseIsEstimated } = buildSalesPurchaseChartData(dashboard);
  const data = rows.length > 0 ? rows : PLACEHOLDER;
  const maxPurchase = data.reduce((m, r) => Math.max(m, r.purchase), 0);
  const showPurchaseSeries = maxPurchase > 0;
  const periodBadge = chartPeriodBadgeLabel(periodMode, dashboard);
  const scopeFootnote = dashboardChartScopeFootnote(dashboard);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Sales vs purchase
              </CardTitle>
              <span className="max-w-[min(100%,280px)] truncate rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:max-w-[360px]">
                {periodBadge}
              </span>
              <DashboardCustomRangePopover
                open={chartRangePopoverOpen}
                onOpenChange={setChartRangePopoverOpen}
                customRange={customRange}
                isCustomPeriod={periodMode === "custom"}
                onActivateCustom={() => onPeriodModeChange("custom")}
                align="start"
                triggerClassName="h-9 w-9"
              />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Uses the same period as{" "}
              <span className="font-medium text-foreground/90">Performance snapshot</span>. Tap a
              calendar icon to set start and end dates (max {MAX_REPORT_DATE_RANGE_MONTHS} months).
              Each column is one calendar month of posted sales and purchase totals.
              {!showPurchaseSeries ? " Purchase columns show when that month has purchases." : ""}
            </p>
            {scopeFootnote ? (
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                {scopeFootnote}
              </p>
            ) : null}
            {purchaseIsEstimated && rows.length > 0 ? (
              <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-500/90">
                Purchase totals per month are not shown yet — only sales appear for now.
              </p>
            ) : null}
          </div>
          {canReports ? (
            <Link
              href="/reports"
              className="shrink-0 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
            >
              All reports
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          config={{
            sales: { label: "Sales", color: salesColor },
            purchase: { label: "Purchase", color: purchaseColor },
          }}
          className={cn(
            "h-[min(320px,55vw)] min-h-[260px] w-full cursor-pointer",
            "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/40",
          )}
        >
          <BarChart
            data={data}
            margin={{ top: 16, right: 8, left: 4, bottom: 8 }}
            barCategoryGap="18%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
            <XAxis
              type="category"
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              width={52}
              domain={[0, "auto"]}
            />
            <ChartTooltip
              cursor={false}
              allowEscapeViewBox={{ x: true, y: true }}
              content={(props) => (
                <SalesPurchaseTooltip
                  {...props}
                  showPurchaseSeries={showPurchaseSeries}
                  purchaseEstimated={purchaseIsEstimated}
                  salesColor={salesColor}
                  purchaseColor={purchaseColor}
                />
              )}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar
              dataKey="sales"
              name="Sales"
              fill={salesColor}
              radius={[6, 6, 0, 0]}
              maxBarSize={56}
            />
            {showPurchaseSeries ? (
              <Bar
                dataKey="purchase"
                name="Purchase"
                fill={purchaseColor}
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            ) : null}
          </BarChart>
        </ChartContainer>
        {rows.length === 0 ? (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            No monthly data yet. Record sales (and purchases) to populate this chart.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
