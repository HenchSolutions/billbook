"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ChartColumnIncreasing,
  CircleDashed,
  HelpCircle,
  Percent,
  Scale,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  fluidDashboardKpiValueClass,
  fluidMetricShellClass,
} from "@/components/dashboard/dashboard-utils";
import { cn, formatCurrency } from "@/lib/core/utils";
import type { DashboardData, DashboardPeriodMode } from "@/types/dashboard";
import { dashboardToNumber, resolveDashboardMarginDisplay } from "@/lib/business/dashboard-home";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MARGIN_HINT =
  "Gross margin from finalized sale and purchase invoices (and expenses as returned by the API) for the selected scope — this month, all time, or a custom date range.";

const PROFIT_HINT =
  "Profit for the selected scope per server rules; uses finalized invoices — open Reports for registers and exports.";

type KpiTone =
  | "today-sales"
  | "period-sales"
  | "purchase"
  | "margin"
  | "profit-positive"
  | "profit-negative"
  | "profit-neutral"
  | "cash"
  | "default";

type MetricKind =
  | "today-sales"
  | "period-sales"
  | "purchase"
  | "margin"
  | "profit-positive"
  | "profit-negative"
  | "profit-neutral"
  | "empty";

/** Card surfaces stay `bg-card`; metric hue is a top accent only (reads cleanly on the dashboard canvas). */
const CARD_SHELL: Record<KpiTone, string> = {
  "today-sales":
    "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-accent",
  "period-sales":
    "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-primary",
  purchase:
    "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-chart-3",
  margin:
    "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-chart-2",
  "profit-positive":
    "border border-border/90 bg-card shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06] border-t-[3px] border-t-status-paid",
  "profit-negative":
    "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-destructive",
  "profit-neutral":
    "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]",
  cash: "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-chart-3",
  default:
    "border border-border/90 bg-muted/20 shadow-sm ring-1 ring-black/[0.02] dark:bg-muted/15 dark:ring-white/[0.04]",
};

const VALUE_CLASS: Record<KpiTone, string> = {
  "today-sales": "text-foreground",
  "period-sales": "text-foreground",
  purchase: "text-foreground",
  margin: "text-foreground",
  "profit-positive": "text-status-paid dark:text-status-paid",
  "profit-negative": "text-destructive dark:text-destructive",
  "profit-neutral": "text-foreground",
  cash: "text-foreground",
  default: "text-muted-foreground",
};

const ICON_SOLID: Record<KpiTone, string> = {
  "today-sales": "bg-accent shadow-md ring-1 ring-accent/30",
  "period-sales": "bg-primary shadow-md ring-1 ring-primary/25",
  purchase: "bg-chart-3 shadow-md ring-1 ring-chart-3/35",
  margin: "bg-chart-2 shadow-md ring-1 ring-chart-2/30",
  "profit-positive": "bg-status-paid shadow-md ring-1 ring-status-paid/35",
  "profit-negative": "bg-destructive shadow-md ring-1 ring-destructive/30",
  "profit-neutral": "bg-muted-foreground shadow-md ring-1 ring-muted-foreground/25",
  cash: "bg-chart-3 shadow-md ring-1 ring-chart-3/25",
  default: "bg-muted-foreground/70 shadow-md ring-1 ring-muted-foreground/20",
};

function iconForMetric(kind: MetricKind): LucideIcon {
  switch (kind) {
    case "today-sales":
      return CalendarClock;
    case "period-sales":
      return ChartColumnIncreasing;
    case "purchase":
      return ShoppingCart;
    case "margin":
      return Percent;
    case "profit-positive":
      return TrendingUp;
    case "profit-negative":
      return TrendingDown;
    case "profit-neutral":
      return Scale;
    case "empty":
      return CircleDashed;
  }
}

function Kpi({
  label,
  value,
  tone,
  metricKind,
  hint,
}: {
  label: string;
  value: string;
  tone: KpiTone;
  metricKind: MetricKind;
  hint?: string;
}) {
  const Icon = iconForMetric(metricKind);
  const profitElevated = tone === "profit-positive";

  return (
    <div
      className={cn(
        fluidMetricShellClass,
        "flex h-full min-h-[108px] flex-col rounded-lg border p-4 transition-shadow duration-200 hover:shadow-md sm:min-h-[112px] sm:p-5",
        profitElevated && "hover:shadow-lg",
        CARD_SHELL[tone],
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-black/[0.06] sm:h-12 sm:w-12",
              ICON_SOLID[tone],
            )}
            aria-hidden
          >
            <Icon className="h-5 w-5 text-white sm:h-[22px] sm:w-[22px]" strokeWidth={1.85} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex min-h-[1.375rem] items-center gap-1.5">
              <p className="text-sm font-medium leading-snug text-muted-foreground sm:text-base">
                {label}
              </p>
              {hint ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex shrink-0 rounded-sm text-muted-foreground outline-none ring-offset-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`About ${label}`}
                    >
                      <HelpCircle className="h-4 w-4" aria-hidden />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                    {hint}
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
        </div>
        <p
          className={cn(
            fluidDashboardKpiValueClass,
            "mt-auto min-h-[2.25rem] pt-2 tabular-nums sm:min-h-[2.5rem] sm:pt-3",
            VALUE_CLASS[tone],
            profitElevated && "tracking-tight",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface DashboardHomeKpisProps {
  dashboard: DashboardData;
  periodMode: DashboardPeriodMode;
}

export function DashboardHomeKpis({ dashboard, periodMode }: DashboardHomeKpisProps) {
  const isOverall = periodMode === "overall";
  const isCustom = periodMode === "custom";

  const today = dashboard.todaySales;
  const monthSales = dashboard.monthSales ?? dashboard.totalRevenue;
  const monthPurchase = dashboard.summaryPurchase;
  const marginStr = resolveDashboardMarginDisplay(dashboard);
  const profitRaw = dashboard.monthProfit;
  const profitNum = profitRaw != null && profitRaw !== "" ? dashboardToNumber(profitRaw) : null;
  const profitStr = profitRaw != null && profitRaw !== "" ? formatCurrency(profitRaw) : "—";

  let profitTone: KpiTone = "profit-neutral";
  let profitKind: MetricKind = "profit-neutral";
  if (profitNum != null && Number.isFinite(profitNum)) {
    if (profitNum > 0) {
      profitTone = "profit-positive";
      profitKind = "profit-positive";
    } else if (profitNum < 0) {
      profitTone = "profit-negative";
      profitKind = "profit-negative";
    }
  }

  const todayStr = today != null && today !== "" ? formatCurrency(today) : "—";
  const marginToneResolved: KpiTone = marginStr === "—" ? "profit-neutral" : "margin";
  const marginKind: MetricKind = marginStr === "—" ? "empty" : "margin";

  const salesLabel = isOverall ? "Total sales" : isCustom ? "Period sales" : "Month sales";
  const purchaseLabel = isOverall
    ? "Total purchase"
    : isCustom
      ? "Period purchase"
      : "Month purchase";
  const profitLabel = isOverall ? "Total profit" : isCustom ? "Period profit" : "Profit";

  const hasPurchase = monthPurchase != null && monthPurchase !== "";
  const purchaseTone: KpiTone = hasPurchase ? "purchase" : "default";
  const purchaseKind: MetricKind = hasPurchase ? "purchase" : "empty";

  const todayTone: KpiTone = todayStr === "—" ? "default" : "today-sales";
  const todayKind: MetricKind = todayStr === "—" ? "empty" : "today-sales";

  return (
    <section>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5 [&>*]:min-w-0">
        <Kpi label="Today sales" value={todayStr} tone={todayTone} metricKind={todayKind} />
        <Kpi
          label={salesLabel}
          value={formatCurrency(monthSales)}
          tone="period-sales"
          metricKind="period-sales"
        />
        <Kpi
          label={purchaseLabel}
          value={hasPurchase ? formatCurrency(monthPurchase) : "—"}
          tone={purchaseTone}
          metricKind={purchaseKind}
        />
        <Kpi
          label="Margin"
          value={marginStr}
          tone={marginToneResolved}
          metricKind={marginKind}
          hint={MARGIN_HINT}
        />
        <Kpi
          label={profitLabel}
          value={profitStr}
          tone={profitTone}
          metricKind={profitKind}
          hint={PROFIT_HINT}
        />
      </div>
    </section>
  );
}
