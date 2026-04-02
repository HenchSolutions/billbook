"use client";

import Link from "next/link";
import { ChevronRight, FileText, Info, Receipt, Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, formatCurrency } from "@/lib/utils";
import { formatISODateDisplay } from "@/lib/date";
import type { ReportsDashboardData } from "@/types/report";

interface ReportsDashboardSectionProps {
  data: ReportsDashboardData;
}

export function ReportsDashboardSection({ data }: ReportsDashboardSectionProps) {
  const { period, receipts, invoices, payouts, debt, payables } = data;

  const periodLabel = `${formatISODateDisplay(period.startDate)} – ${formatISODateDisplay(period.endDate)}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Period:</span> {periodLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          Activity figures follow your range; AR/AP are current ledger balances.
        </p>
      </div>

      <section aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="mb-3 text-sm font-medium text-foreground">
          In this period
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiLinkCard
            href="/reports/receipt-register"
            label="Receipts"
            count={receipts.count}
            totalAmount={receipts.totalAmount}
            icon={Receipt}
          />
          <KpiLinkCard
            href="/reports/invoice-register"
            label="Invoices"
            count={invoices.count}
            totalAmount={invoices.totalAmount}
            icon={FileText}
          />
          <KpiLinkCard
            href="/reports/payout-register"
            label="Payouts"
            count={payouts.count}
            totalAmount={payouts.totalAmount}
            icon={Wallet}
          />
        </div>
      </section>

      <section aria-labelledby="balances-heading">
        <h2 id="balances-heading" className="mb-3 text-sm font-medium text-foreground">
          Ledger balances
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <BalanceLinkCard
            href="/reports/debt-register"
            title="Receivables"
            tooltip="Total customers owe you right now (open AR on the ledger)."
            amount={debt.totalReceivable}
            meta={`${debt.debtorCount} ${debt.debtorCount === 1 ? "debtor" : "debtors"}`}
            accent="emerald"
          />
          <BalanceLinkCard
            href="/reports/payables-register"
            title="Payables"
            tooltip="Total you owe suppliers right now (open AP on the ledger)."
            amount={payables.totalPayable}
            meta={`${payables.creditorCount} ${payables.creditorCount === 1 ? "creditor" : "creditors"}`}
            accent="rose"
          />
        </div>
      </section>
    </div>
  );
}

function KpiLinkCard({
  href,
  label,
  count,
  totalAmount,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  totalAmount: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors",
        "hover:border-primary/30 hover:bg-muted/30",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {count}
          </p>
          <p className="text-sm tabular-nums text-muted-foreground">
            Total {formatCurrency(totalAmount)}
          </p>
        </div>
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-3 text-xs font-medium text-primary/90 group-hover:text-primary">
        Open register <span aria-hidden>→</span>
      </p>
    </Link>
  );
}

function BalanceLinkCard({
  href,
  title,
  tooltip,
  amount,
  meta,
  accent,
}: {
  href: string;
  title: string;
  tooltip: string;
  amount: string;
  meta: string;
  accent: "emerald" | "rose";
}) {
  const border =
    accent === "emerald"
      ? "border-l-emerald-600/70 hover:border-l-emerald-600"
      : "border-l-rose-600/70 hover:border-l-rose-600";

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg border border-y border-l-[3px] border-r border-border bg-card shadow-sm transition-colors",
        border,
        "hover:bg-muted/20",
      )}
    >
      <Link
        href={href}
        className={cn(
          "group min-w-0 flex-1 p-4 pl-[17px] outline-none transition-colors",
          "hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {formatCurrency(amount)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
        <p className="mt-3 text-xs font-medium text-primary/90 group-hover:text-primary">
          Open register <span aria-hidden>→</span>
        </p>
      </Link>
      <div className="flex shrink-0 flex-col border-l border-border/80 bg-muted/25">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex h-full min-h-[4.5rem] items-center justify-center px-2.5 text-muted-foreground outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`About ${title}`}
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[240px] text-xs leading-relaxed">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
