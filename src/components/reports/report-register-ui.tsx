import { Table2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/core/utils";

export {
  PageSearchCard as ReportRegisterSearchCard,
  PageSearchActions,
} from "@/components/PageSearchSection";

/**
 * Register search: date range block, optional filters grid, then actions.
 * Grouped so each step is easy to scan (not one crowded row).
 */
export function ReportRegisterSearchLayout({
  period,
  filters,
  actions,
}: {
  period?: React.ReactNode;
  filters?: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {period ? (
        <section
          aria-label="Date range"
          className="rounded-md border border-border/50 bg-muted/20 px-3 py-2.5"
        >
          {period}
        </section>
      ) : null}
      {filters ? <section aria-label="Search filters">{filters}</section> : null}
      <div className="flex justify-end border-t border-border/50 pt-2.5">{actions}</div>
    </div>
  );
}

/** @deprecated Use ReportRegisterSearchLayout */
export function ReportRegisterSearchBody({
  children,
  actions,
  className,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end gap-x-2 gap-y-2", className)}>
      {children}
      {actions}
    </div>
  );
}

/** Filter fields — one column on mobile, two per row from sm up. */
export function ReportSearchGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid grid-cols-1 gap-2.5 sm:grid-cols-2", className)}>{children}</div>;
}

export function ReportSearchField({
  label,
  children,
  className,
  hint,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {optional ? (
          <span className="shrink-0 text-[10px] font-medium uppercase text-muted-foreground/80">
            Optional
          </span>
        ) : null}
      </div>
      {children}
      {hint ? (
        <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Filter row(s) for date range, limit, extra actions — card on the page. */
export function ReportRegisterFilterCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-4 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm sm:px-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ReportRegisterFilterGridProps = {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
};

/** Shared filter layout for all register pages. */
export function ReportRegisterFilterGrid({
  children,
  cols = 2,
  className,
}: ReportRegisterFilterGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2.5 sm:gap-3 xl:items-end",
        cols === 1 && "xl:grid-cols-1",
        cols === 2 && "xl:grid-cols-[minmax(0,1fr)_auto]",
        cols === 3 && "xl:grid-cols-[minmax(0,1fr)_auto_auto]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ReportRegisterFilterGroup({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/60 bg-muted/15 p-2.5 sm:p-3", className)}>
      {title ? (
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/** Optional bar above the table: row count and truncation hint. */
export function ReportRegisterResultBar({
  count,
  rowLabel,
  limit,
  /** API row count before client-side filters — used only for the truncation hint. */
  truncationHintCount,
}: {
  count: number;
  /** e.g. "receipts", "invoices" — plural, lowercase */
  rowLabel: string;
  limit?: number;
  truncationHintCount?: number;
}) {
  const trunc = truncationHintCount ?? count;
  const maybeTruncated = limit !== undefined && trunc > 0 && trunc >= limit;

  return (
    <div className="border-b border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{count}</span> {rowLabel}
      {maybeTruncated ? (
        <span className="text-status-pending">
          {" "}
          · Showing up to {limit} rows — raise the limit if you need more.
        </span>
      ) : null}
    </div>
  );
}

export function ReportRegisterEmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center sm:px-6">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Table2 className="h-9 w-9 opacity-35" aria-hidden />
          <p className="max-w-sm text-sm leading-relaxed">{message}</p>
        </div>
      </td>
    </tr>
  );
}

export function ReportRegisterSummaryCard({
  variant,
  children,
}: {
  variant: "emerald" | "rose";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-5 py-4 text-sm shadow-sm",
        variant === "emerald" && "border-status-paid/25 bg-status-paid/[0.06]",
        variant === "rose" && "border-destructive/25 bg-destructive/[0.06]",
      )}
    >
      {children}
    </div>
  );
}

/** Scroll + card shell; put thead sticky inside. */
export function ReportRegisterTableScroll({ children }: { children: React.ReactNode }) {
  return <div className="data-table-container">{children}</div>;
}

export const rr = {
  table: "data-table register-report-table min-w-[880px] border-collapse",
  thead: "data-table-head-sticky",
  th: "data-table-th whitespace-nowrap text-xs uppercase tracking-wide",
  thRight: "data-table-th data-table-col-numeric whitespace-nowrap text-xs uppercase tracking-wide",
  td: "data-table-td align-middle text-foreground",
  tdMuted: "data-table-td align-middle text-sm text-muted-foreground",
  tdRight: "data-table-td data-table-col-numeric align-middle text-foreground",
  tdRightMuted: "data-table-td data-table-col-numeric align-middle text-muted-foreground",
  tr: "data-table-row last:border-b-0",
  link: "font-medium text-primary underline-offset-4 hover:underline",
} as const;
