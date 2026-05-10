import { cn, formatCurrency, formatDate } from "@/lib/core/utils";
import { formatLedgerEntryTypeLabel } from "@/lib/party/party-ledger-display";
import type { LedgerEntry } from "@/lib/party/party-ledger";
import { LedgerBalanceText } from "@/components/party-ledger/LedgerBalanceText";
import { DataTableRoot } from "@/components/ui/data-table";

export type PartyLedgerTableVariant = "ledger" | "statement";

interface PartyLedgerEntriesTableProps {
  entries: LedgerEntry[];
  /** `ledger`: hide Debit/Credit on very small screens. `statement`: always show all columns. */
  variant: PartyLedgerTableVariant;
}

/**
 * Shared transaction table for the Ledger tab and Statement tab (same columns, no duplicated markup).
 */
export function PartyLedgerEntriesTable({ entries, variant }: PartyLedgerEntriesTableProps) {
  const drCrHide = variant === "ledger" ? "hidden sm:table-cell" : "";

  return (
    <DataTableRoot density="default" className="rounded-md">
      <table className="data-table min-w-[280px]">
        <thead className="data-table-head-sticky text-muted-foreground">
          <tr>
            <th className="data-table-th">Date</th>
            <th className="data-table-th">Entry</th>
            <th className={cn("data-table-th data-table-col-numeric", drCrHide)}>Debit</th>
            <th className={cn("data-table-th data-table-col-numeric", drCrHide)}>Credit</th>
            <th className="data-table-th data-table-col-numeric">Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={`${entry.entryType}-${idx}`} className="data-table-row">
              <td className="data-table-td text-muted-foreground">
                {formatDate(entry.entryDate ?? entry.createdAt)}
              </td>
              <td className="data-table-td">{formatLedgerEntryTypeLabel(entry.entryType)}</td>
              <td
                className={cn(
                  "data-table-td data-table-col-numeric",
                  drCrHide,
                  entry.debitAmount && "font-medium text-red-600",
                )}
              >
                {entry.debitAmount ? formatCurrency(entry.debitAmount) : "—"}
              </td>
              <td
                className={cn(
                  "data-table-td data-table-col-numeric",
                  drCrHide,
                  entry.creditAmount && "font-medium text-emerald-600",
                )}
              >
                {entry.creditAmount ? formatCurrency(entry.creditAmount) : "—"}
              </td>
              <td className="data-table-td data-table-col-numeric">
                <LedgerBalanceText
                  value={entry.runningBalance}
                  size="sm"
                  align="end"
                  tagStyle="abbrev"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableRoot>
  );
}
