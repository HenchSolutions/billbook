import Link from "next/link";
import { ExternalLink, ListOrdered } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableRoot } from "@/components/ui/data-table";
import TablePagination from "@/components/TablePagination";
import { formatCurrency, formatDate } from "@/lib/core/utils";
import { openSignedPdfFromApiPath } from "@/lib/ui/signed-pdf";
import { OUTBOUND_CATEGORY_LABELS } from "@/constants/outbound-payment";
import { PAYMENT_METHOD_LABEL } from "@/constants/receipt-ui";
import type { OutboundPayment } from "@/types/outbound-payment";

/** Prefer directory lookup by id when the API omits or mis-sends `partyName`. */
function outboundPartyDisplayName(
  p: OutboundPayment,
  partyNamesById?: ReadonlyMap<number, string>,
): string {
  if (p.category === "EXPENSE") {
    return p.payeeName?.trim() || "—";
  }
  const id = p.partyId;
  if (id != null) {
    const fromDirectory = partyNamesById?.get(id);
    if (fromDirectory?.trim()) return fromDirectory.trim();
  }
  const raw = p.partyName?.trim();
  if (raw) return raw;
  return id != null ? "Unknown party" : "—";
}

interface OutboundPaymentsTableProps {
  payments: OutboundPayment[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Inclusive row range on this page (for the summary bar). */
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (p: number) => void;
  /** Resolve `partyId` → display name when the list API does not return `partyName`. */
  partyNamesById?: ReadonlyMap<number, string>;
}

export function OutboundPaymentsTable({
  payments,
  page,
  pageSize,
  total,
  totalPages,
  rangeStart,
  rangeEnd,
  onPageChange,
  partyNamesById,
}: OutboundPaymentsTableProps) {
  return (
    <Card className="overflow-hidden rounded-lg border-border/60 shadow-md ring-1 ring-border/40">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/60">
              <ListOrdered className="h-4 w-4 text-muted-foreground" aria-hidden />
            </span>
            Vouchers
          </div>
          <p className="text-xs tabular-nums text-muted-foreground">
            <span className="font-medium text-foreground">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of {total}
          </p>
        </div>
        <DataTableRoot density="default" className="overflow-x-auto border-0 shadow-none">
          <table className="data-table min-w-[720px]">
            <thead className="data-table-head-sticky">
              <tr>
                <th className="data-table-th px-4 text-[11px] uppercase tracking-wider">Voucher</th>
                <th className="data-table-th px-4 text-[11px] uppercase tracking-wider">Type</th>
                <th className="data-table-th px-4 text-[11px] uppercase tracking-wider">Date</th>
                <th className="data-table-th px-4 text-[11px] uppercase tracking-wider">
                  Party / payee
                </th>
                <th className="data-table-th px-4 text-[11px] uppercase tracking-wider">Method</th>
                <th className="data-table-th data-table-col-numeric px-4 text-[11px] uppercase tracking-wider">
                  Amount
                </th>
                <th className="data-table-th data-table-col-numeric px-4 text-[11px] uppercase tracking-wider">
                  PDF
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:nth-child(even)]:bg-muted/15">
              {payments.map((p) => (
                <tr key={p.id} className="data-table-row last:border-0">
                  <td className="data-table-td px-4 font-medium text-foreground">
                    <span className="financial-id">{p.paymentNumber}</span>
                  </td>
                  <td className="data-table-td px-4">
                    <Badge variant="outline" className="whitespace-nowrap shadow-sm">
                      {OUTBOUND_CATEGORY_LABELS[p.category] ?? p.category}
                    </Badge>
                  </td>
                  <td className="data-table-td px-4 text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="data-table-td max-w-[200px] px-4">
                    <span className="truncate">{outboundPartyDisplayName(p, partyNamesById)}</span>
                    {p.invoiceId != null && p.category === "SALE_RETURN_REFUND" && (
                      <div className="mt-0.5 text-xs">
                        <Link
                          href={`/invoices/${p.invoiceId}`}
                          className="text-primary hover:underline"
                        >
                          Sales return
                        </Link>
                      </div>
                    )}
                    {p.invoiceId != null && p.category === "PARTY_PAYMENT" && (
                      <div className="mt-0.5 text-xs">
                        <Link
                          href={`/invoices/${p.invoiceId}`}
                          className="text-primary hover:underline"
                        >
                          Purchase bill
                        </Link>
                      </div>
                    )}
                  </td>
                  <td className="data-table-td px-4">
                    <Badge variant="outline" className="font-normal shadow-sm">
                      {PAYMENT_METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
                    </Badge>
                  </td>
                  <td className="data-table-td data-table-col-numeric px-4 font-semibold text-rose-700">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="data-table-td data-table-col-numeric px-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 rounded-md shadow-sm"
                      onClick={() =>
                        void openSignedPdfFromApiPath(`/payments/outbound/${p.id}/pdf`, {
                          unavailable: "Voucher PDF not available (configure storage).",
                          failed: "Failed to open voucher PDF",
                        })
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableRoot>
        {totalPages > 1 ? (
          <div className="border-t border-border/60 bg-muted/15 px-4 py-3 sm:px-5">
            <TablePagination
              className="mt-0"
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
