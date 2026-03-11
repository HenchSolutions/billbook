import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { getInvoiceBalanceDue, INVOICE_TYPE_OPTIONS } from "@/lib/invoice";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceDetail } from "@/types/invoice";

interface InvoiceSummaryCardsProps {
  invoice: InvoiceDetail;
  balanceDue: string;
}

export function InvoiceSummaryCards({ invoice, balanceDue }: InvoiceSummaryCardsProps) {
  const balanceDueValue = getInvoiceBalanceDue(invoice);
  const total = parseFloat(invoice.totalAmount ?? "0") || 0;
  const paid = parseFloat(invoice.paidAmount ?? "0") || 0;
  const paidPercent = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const typeLabel =
    INVOICE_TYPE_OPTIONS.find((o) => o.type === invoice.invoiceType)?.label ?? invoice.invoiceType;
  const isFullyPaid = balanceDueValue <= 0 && invoice.status === "FINAL";

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-0">
        {/* Status accent bar */}
        <div
          className={cn(
            "h-1",
            invoice.status === "DRAFT" && "bg-amber-400",
            invoice.status === "FINAL" && (isFullyPaid ? "bg-emerald-500" : "bg-primary"),
            invoice.status === "CANCELLED" && "bg-muted-foreground/30",
          )}
        />

        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: invoice identity + party + dates */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {typeLabel}
              </span>
              <StatusBadge status={invoice.status} />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h2>
              {invoice.partyName && (
                <p className="mt-0.5 text-base text-muted-foreground">{invoice.partyName}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">
                Issued{" "}
                <span className="font-medium text-foreground">
                  {formatDate(invoice.invoiceDate)}
                </span>
              </span>
              {invoice.dueDate && (
                <span
                  className={cn(
                    "text-muted-foreground",
                    invoice.isOverdue && "font-medium text-destructive",
                  )}
                >
                  Due{" "}
                  <span className={cn("font-medium", !invoice.isOverdue && "text-foreground")}>
                    {formatDate(invoice.dueDate)}
                  </span>
                  {invoice.isOverdue && invoice.overdueDays && invoice.overdueDays > 0 && (
                    <span className="ml-1 text-xs">({invoice.overdueDays}d overdue)</span>
                  )}
                </span>
              )}
              {invoice.financialYear && (
                <span className="text-muted-foreground">
                  FY <span className="font-medium text-foreground">{invoice.financialYear}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: financial summary */}
          <div className="shrink-0 space-y-3 sm:min-w-[180px] sm:text-right">
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold tabular-nums">
                {formatCurrency(invoice.totalAmount)}
              </p>
            </div>

            {invoice.status === "FINAL" && (
              <div className="space-y-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isFullyPaid ? "bg-emerald-500" : "bg-primary",
                    )}
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(paidPercent)}% collected
                </p>
              </div>
            )}

            <div className="flex gap-6 sm:flex-col sm:gap-1.5">
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-sm font-semibold tabular-nums text-emerald-600">
                  {formatCurrency(invoice.paidAmount ?? "0")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance Due</p>
                <p
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    isFullyPaid ? "text-emerald-600" : invoice.isOverdue ? "text-destructive" : "",
                  )}
                >
                  {isFullyPaid ? "Paid in full" : formatCurrency(balanceDue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
