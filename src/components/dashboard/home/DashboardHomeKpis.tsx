"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChartColumnIncreasing,
  CircleDashed,
  HelpCircle,
  Percent,
  Repeat2,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  fluidDashboardKpiValueClass,
  fluidMetricShellClass,
} from "@/components/dashboard/dashboard-utils";
import { cn, formatCurrency } from "@/lib/core/utils";
import type { DashboardCustomRangeFields } from "@/components/dashboard/DashboardCustomRangePopover";
import type { DashboardData, DashboardPeriodMode } from "@/types/dashboard";
import { dashboardToNumber, resolveDashboardMarginDisplay } from "@/lib/business/dashboard-home";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DashboardCustomRangePopover } from "@/components/dashboard/DashboardCustomRangePopover";

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

/**
 * Today vs period sales must read at a glance: “today” = warm amber/day clock;
 * period total sales = brand peach/coral pipeline (distinct families).
 */
const CARD_SHELL: Record<KpiTone, string> = {
  "today-sales":
    "border-[hsl(38_50%_82%)] bg-[hsl(48_70%_96%)] shadow-sm ring-1 ring-amber-200/50 dark:border-amber-900/35 dark:bg-amber-950/25 dark:ring-amber-900/40",
  "period-sales":
    "border-[hsl(14_42%_86%)] bg-[hsl(14_62%_97%)] shadow-sm ring-1 ring-primary/20 dark:border-primary/25 dark:bg-primary/10 dark:ring-primary/20",
  purchase: "border-[hsl(142_32%_88%)] bg-[hsl(142_48%_96%)] shadow-sm dark:border-emerald-900/30",
  margin: "border-[hsl(206_38%_88%)] bg-[hsl(206_52%_97%)] shadow-sm dark:border-sky-900/35",
  "profit-positive":
    "border-emerald-600/35 bg-gradient-to-br from-emerald-50 via-teal-50/90 to-emerald-100/70 shadow-md ring-2 ring-emerald-200/80 dark:border-emerald-500/30 dark:from-emerald-950/50 dark:via-emerald-950/35 dark:to-teal-950/40 dark:ring-emerald-700/50",
  "profit-negative":
    "border-[hsl(0_50%_82%)] bg-[hsl(0_85%_97%)] shadow-sm ring-1 ring-red-200/60 dark:border-red-900/40 dark:bg-red-950/25",
  "profit-neutral":
    "border-[hsl(215_28%_88%)] bg-[hsl(215_35%_96%)] shadow-sm dark:border-slate-700 dark:bg-slate-900/40",
  cash: "border-[hsl(38_42%_88%)] bg-[hsl(45_90%_96%)] shadow-sm",
  default:
    "border-[hsl(43_30%_90%)] bg-[hsl(48_40%_97%)] shadow-sm dark:border-border dark:bg-muted/30",
};

const VALUE_CLASS: Record<KpiTone, string> = {
  "today-sales": "text-[hsl(28_45%_22%)] dark:text-amber-100",
  "period-sales": "text-foreground",
  purchase: "text-foreground",
  margin: "text-foreground",
  "profit-positive": "text-emerald-900 dark:text-emerald-200",
  "profit-negative": "text-red-700 dark:text-red-300",
  "profit-neutral": "text-foreground",
  cash: "text-foreground",
  default: "text-muted-foreground",
};

const ICON_SOLID: Record<KpiTone, string> = {
  "today-sales":
    "bg-gradient-to-br from-amber-500 to-amber-600 shadow-md ring-1 ring-amber-400/30 dark:from-amber-600 dark:to-amber-700",
  "period-sales": "bg-primary shadow-md ring-1 ring-primary/25",
  purchase: "bg-[hsl(152_52%_38%)] dark:bg-emerald-700",
  margin: "bg-[hsl(206_62%_50%)] dark:bg-sky-600",
  "profit-positive":
    "bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md ring-2 ring-emerald-400/40 dark:from-emerald-500 dark:to-teal-600",
  "profit-negative": "bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700",
  "profit-neutral": "bg-[hsl(215_22%_42%)] dark:bg-slate-600",
  cash: "bg-[hsl(38_88%_46%)]",
  default: "bg-[hsl(35_12%_52%)] dark:bg-muted-foreground/60",
};

function iconForMetric(kind: MetricKind): LucideIcon {
  switch (kind) {
    case "today-sales":
      return CalendarDays;
    case "period-sales":
      return ChartColumnIncreasing;
    case "purchase":
      return Repeat2;
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
        "flex h-full min-h-[112px] flex-col justify-center rounded-lg border p-6 transition-shadow duration-200 hover:shadow-md sm:min-h-[120px]",
        profitElevated && "hover:shadow-lg",
        CARD_SHELL[tone],
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-black/[0.06]",
            ICON_SOLID[tone],
          )}
          aria-hidden
        >
          <Icon className="h-[22px] w-[22px] text-white" strokeWidth={1.85} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-1.5">
            <p className="text-base font-medium leading-snug text-muted-foreground">{label}</p>
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
          <p
            className={cn(
              fluidDashboardKpiValueClass,
              VALUE_CLASS[tone],
              profitElevated && "tracking-tight",
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface DashboardHomeKpisProps {
  dashboard: DashboardData;
  periodMode: DashboardPeriodMode;
  onPeriodModeChange: (mode: DashboardPeriodMode) => void;
  customRange: DashboardCustomRangeFields;
}

export function DashboardHomeKpis({
  dashboard,
  periodMode,
  onPeriodModeChange,
  customRange,
}: DashboardHomeKpisProps) {
  const [rangePopoverOpen, setRangePopoverOpen] = useState(false);

  useEffect(() => {
    if (periodMode !== "custom") setRangePopoverOpen(false);
  }, [periodMode]);

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Performance snapshot
        </h2>
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:w-auto sm:items-end">
          <div className="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => {
                setRangePopoverOpen(false);
                onPeriodModeChange("monthly");
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                periodMode === "monthly"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              This month
            </button>
            <button
              type="button"
              onClick={() => {
                setRangePopoverOpen(false);
                onPeriodModeChange("overall");
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                periodMode === "overall"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All time
            </button>
            <DashboardCustomRangePopover
              open={rangePopoverOpen}
              onOpenChange={setRangePopoverOpen}
              customRange={customRange}
              isCustomPeriod={periodMode === "custom"}
              onActivateCustom={() => onPeriodModeChange("custom")}
              align="end"
            />
          </div>
        </div>
      </div>

      <div className="grid auto-rows-fr grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5 [&>*]:min-w-0">
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
