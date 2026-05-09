import type { ReactNode } from "react";
import { cn } from "@/lib/core/utils";

/** Inline-size container so metric values can use `cqi` for fluid font sizing inside cards. */
export const fluidMetricShellClass = "min-w-0 max-w-full [container-type:inline-size]";

/** Performance snapshot KPI figure — scales down in narrow cells when amounts are long. */
export const fluidSnapshotValueClass =
  "min-w-0 max-w-full font-semibold tabular-nums leading-none tracking-tight text-[clamp(0.6875rem,calc(0.38rem+6.25cqi),1.75rem)]";

/** Top-row dashboard KPIs — InApp uses h3.fw-bold for the main figure; slightly higher floor for legibility. */
export const fluidDashboardKpiValueClass =
  "min-w-0 max-w-full font-bold tabular-nums leading-tight tracking-tight text-[clamp(1.125rem,calc(0.5rem+5.25cqi),1.875rem)]";

/** Larger headline figures (receivables / payables totals, balance cards). */
export const fluidSectionStatClass =
  "min-w-0 max-w-full font-semibold tabular-nums leading-tight text-[clamp(1rem,calc(0.5rem+4.25cqi),1.5rem)]";

/** Inline totals in dashboard ranking rows — avoids overflow without clipping digits when possible. */
export const fluidRowAmountClass =
  "min-w-0 max-w-full text-end font-semibold tabular-nums text-[clamp(0.65rem,calc(0.28rem+3.8cqi),0.875rem)]";

/** Reports hub KPI primary count. */
export const fluidReportsCountClass =
  "font-semibold tabular-nums tracking-tight text-[clamp(1.125rem,calc(0.45rem+5.5cqi),1.75rem)]";

/** Reports hub “Total ₹…” caption under count. */
export const fluidReportsTotalLineClass =
  "tabular-nums text-[clamp(0.65rem,calc(0.22rem+3.4cqi),0.875rem)] text-muted-foreground";

/** Inventory pulse stat figures (counts). */
export const fluidInventoryPulseValueClass =
  "font-semibold tabular-nums text-[clamp(1rem,calc(0.42rem+5cqi),1.5rem)]";

/**
 * Reports shortcuts on dashboard cards — same footprint as `TabsTrigger` so they read as controls
 * (plain `text-primary` links looked inert next to highlighted tabs).
 */
export const dashboardReportsNavLinkClass = cn(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5",
  "text-xs font-medium sm:text-sm",
  "border border-border/60 bg-background text-foreground shadow-sm",
  "transition-colors hover:border-primary/30 hover:bg-primary hover:text-primary-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

export function DashboardSectionHeader({
  id,
  title,
  action,
  className,
}: {
  id?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
