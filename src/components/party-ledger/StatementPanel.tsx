import { Download, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/DateRangePicker";
import { PartyLedgerEntriesTable } from "@/components/party-ledger/PartyLedgerEntriesTable";
import { partyLedgerBalanceInlineParts } from "@/lib/party/party-ledger-display";
import { cn, formatCurrency } from "@/lib/core/utils";
import type { StatementJsonData, StatementPdfData } from "@/lib/party/party-ledger";

interface StatementPanelProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onLoadStatement: () => void;
  onGeneratePdf: () => void;
  isFetching: boolean;
  statement?: StatementJsonData | null;
  pdf?: StatementPdfData | null;
}

export function StatementPanel({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onLoadStatement,
  onGeneratePdf,
  isFetching,
  statement,
  pdf,
}: StatementPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            compact
            className="min-w-0 flex-1"
          />
          <div className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-3 lg:border-t-0 lg:pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadStatement}
              disabled={isFetching}
            >
              <RefreshCcw className={cn("mr-1.5 h-3.5 w-3.5", isFetching && "animate-spin")} />
              Load
            </Button>
            <Button type="button" size="sm" onClick={onGeneratePdf} disabled={isFetching}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {statement && (
        <div className="space-y-3">
          <StatementPeriodSummary statement={statement} />

          <PartyLedgerEntriesTable entries={statement.entries} variant="statement" />
        </div>
      )}

      {pdf && (
        <div className="rounded-md border bg-muted/20 p-3 text-sm">
          {pdf.storageConfigured ? (
            <div className="flex items-center justify-between gap-3">
              <span>PDF ready.</span>
              {pdf.downloadUrl && (
                <Button asChild size="sm" variant="outline">
                  <a href={pdf.downloadUrl} target="_blank" rel="noreferrer">
                    Download
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <span>PDF storage is not configured.</span>
          )}
        </div>
      )}
    </div>
  );
}

function StatementPeriodSummary({ statement }: { statement: StatementJsonData }) {
  const opening = partyLedgerBalanceInlineParts(statement.openingBalance);
  const closing = partyLedgerBalanceInlineParts(statement.closingBalance);

  return (
    <div className="rounded-md border border-border bg-muted/10 px-3 py-3 text-sm" role="note">
      <dl className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">Opening</dt>
          <dd className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {opening.amountStr}
            </span>
            <span className={cn("min-w-0 shrink", opening.labelClassName)}>{opening.label}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">Closing</dt>
          <dd className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {closing.amountStr}
            </span>
            <span className={cn("min-w-0 shrink", closing.labelClassName)}>{closing.label}</span>
          </dd>
        </div>
        <div className="min-w-0 sm:border-l sm:border-border sm:pl-6">
          <dt className="text-xs font-medium text-muted-foreground">Movement this period</dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="inline-flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
              <span className="text-xs font-medium text-muted-foreground">Debits</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(statement.totals.debit)}
              </span>
            </span>
            <span className="inline-flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
              <span className="text-xs font-medium text-muted-foreground">Credits</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(statement.totals.credit)}
              </span>
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
