import Link from "next/link";
import { LinkedInvoiceLink } from "@/components/invoices/LinkedInvoiceLink";
import { Button } from "@/components/ui/button";
import { DataTableRoot } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/core/utils";
import {
  creditNotePartyNameDisplay,
  creditNoteSourceInvoiceLinkProps,
} from "@/lib/credit-notes/credit-note-display";
import type { CreditNoteSummary } from "@/types/credit-note";

interface CreditNotesTableProps {
  creditNotes: CreditNoteSummary[];
  onView: (id: number) => void;
}

/** Remaining unallocated amount for list row (matches GET /credit-notes when fields are present). */
function resolvedUnallocated(cn: CreditNoteSummary): number | null {
  if (cn.unallocatedAmount != null && cn.unallocatedAmount !== "") {
    const n = parseFloat(cn.unallocatedAmount);
    return Number.isFinite(n) ? n : null;
  }
  const total = parseFloat(cn.amount) || 0;
  if (cn.allocatedAmount != null && cn.allocatedAmount !== "") {
    const alloc = parseFloat(cn.allocatedAmount) || 0;
    return Math.max(0, total - alloc);
  }
  return null;
}

function canAllocateCreditNote(cn: CreditNoteSummary): boolean {
  const u = resolvedUnallocated(cn);
  if (u === null) return true;
  return u > 0.001;
}

export function CreditNotesTable({ creditNotes, onView }: CreditNotesTableProps) {
  return (
    <DataTableRoot density="default" className="-mx-1 px-1 sm:mx-0 sm:px-0">
      <table className="data-table" role="table" aria-label="Credit notes list">
        <thead className="data-table-head-sticky">
          <tr>
            <th scope="col" className="data-table-th px-4 sm:px-6">
              Credit note
            </th>
            <th scope="col" className="data-table-th hidden md:table-cell">
              Customer
            </th>
            <th scope="col" className="data-table-th hidden md:table-cell">
              Linked invoice
            </th>
            <th scope="col" className="data-table-th hidden lg:table-cell">
              Reason
            </th>
            <th scope="col" className="data-table-th data-table-col-numeric">
              Amount
            </th>
            <th scope="col" className="data-table-th data-table-col-numeric hidden sm:table-cell">
              Unallocated
            </th>
            <th scope="col" className="data-table-th data-table-col-numeric px-2 sm:px-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {creditNotes.map((cn) => {
            const allocate = canAllocateCreditNote(cn);
            const unalloc = resolvedUnallocated(cn);
            const partyLabel = creditNotePartyNameDisplay(cn);
            const sourceInvoiceProps = creditNoteSourceInvoiceLinkProps(cn);
            return (
              <tr
                key={cn.id}
                className="data-table-row last:border-0"
                role="button"
                tabIndex={0}
                onClick={() => onView(cn.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onView(cn.id)}
              >
                <td className="data-table-td min-w-0 max-w-[min(100vw-4rem,28rem)] px-4 font-medium sm:max-w-none sm:px-6">
                  <div className="flex min-w-0 flex-nowrap items-baseline gap-x-2 md:block">
                    <button
                      type="button"
                      className="financial-id shrink-0 text-left text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(cn.id);
                      }}
                    >
                      {cn.creditNoteNumber}
                    </button>
                    <span
                      className="min-w-0 flex-1 truncate text-xs font-normal text-muted-foreground md:hidden"
                      title={partyLabel}
                    >
                      <span aria-hidden className="text-muted-foreground/70">
                        ·{" "}
                      </span>
                      {partyLabel}
                    </span>
                  </div>
                </td>
                <td
                  className="data-table-td hidden max-w-[200px] truncate text-muted-foreground md:table-cell"
                  title={partyLabel}
                >
                  {partyLabel}
                </td>
                <td className="data-table-td hidden md:table-cell">
                  <LinkedInvoiceLink {...sourceInvoiceProps} onClick={(e) => e.stopPropagation()} />
                </td>
                <td className="data-table-td hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                  {cn.reason ?? "—"}
                </td>
                <td className="data-table-td data-table-col-numeric font-medium">
                  {formatCurrency(cn.amount)}
                </td>
                <td className="data-table-td data-table-col-numeric hidden sm:table-cell">
                  {unalloc != null ? (
                    unalloc > 0.001 ? (
                      <span className="font-medium text-amber-800">
                        {formatCurrency(String(unalloc))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="data-table-td data-table-col-numeric px-2 sm:px-3">
                  <div
                    className="flex flex-wrap items-center justify-end gap-1 sm:justify-end sm:gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {allocate ? (
                      <Button variant="default" size="sm" className="h-8 shrink-0" asChild>
                        <Link href={`/credit-notes/${cn.id}#credit-note-allocate`}>Allocate</Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0 text-muted-foreground"
                        disabled
                        title="Fully allocated — open the credit note from the number above to review"
                      >
                        Allocate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataTableRoot>
  );
}
