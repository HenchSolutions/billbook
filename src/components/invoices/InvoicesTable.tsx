"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { LinkedInvoiceLink } from "@/components/invoices/LinkedInvoiceLink";
import { DataTableRoot } from "@/components/ui/data-table";
import { getInvoiceBalanceDue } from "@/lib/invoice/invoice";
import { cn, formatCurrency, formatDate } from "@/lib/core/utils";
import type { Invoice, InvoiceType } from "@/types/invoice";

interface InvoicesTableProps {
  invoices: Invoice[];
  invoiceType: InvoiceType;
}

export function InvoicesTable({ invoices, invoiceType }: InvoicesTableProps) {
  const router = useRouter();
  const showVendorBillColumn =
    invoiceType === "PURCHASE_INVOICE" || invoiceType === "PURCHASE_RETURN";
  const showRefInvoiceColumn = invoiceType === "SALE_RETURN" || invoiceType === "PURCHASE_RETURN";
  const mobileColSpan = 7 + (showVendorBillColumn ? 1 : 0) + (showRefInvoiceColumn ? 1 : 0);

  return (
    <DataTableRoot density="default" className="-mx-1 px-1 sm:mx-0 sm:px-0">
      <table className="data-table min-w-[300px]" role="table" aria-label="Invoices list">
        <thead className="data-table-head-sticky hidden sm:table-header-group">
          <tr>
            <th scope="col" className="data-table-th px-4 sm:px-6">
              Invoice #
            </th>
            <th scope="col" className="data-table-th">
              Party
            </th>
            {showVendorBillColumn && (
              <th scope="col" className="data-table-th hidden lg:table-cell">
                Vendor bill
              </th>
            )}
            {showRefInvoiceColumn && (
              <th scope="col" className="data-table-th hidden lg:table-cell">
                Linked Invoice
              </th>
            )}
            <th scope="col" className="data-table-th hidden sm:table-cell">
              Date
            </th>
            <th scope="col" className="data-table-th hidden md:table-cell">
              Due Date
            </th>
            <th scope="col" className="data-table-th data-table-col-numeric">
              Amount
            </th>
            <th scope="col" className="data-table-th data-table-col-numeric hidden md:table-cell">
              Balance Due
            </th>
            <th scope="col" className="data-table-th text-center">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const isCancelled = inv.status === "CANCELLED";
            const balanceDue = isCancelled ? 0 : getInvoiceBalanceDue(inv);
            const isFullyPaid = !isCancelled && balanceDue <= 0 && inv.status === "FINAL";
            const showOverdueChrome = Boolean(inv.isOverdue && !isCancelled);

            return (
              <tr
                key={inv.id}
                onClick={() => router.push(`/invoices/${inv.id}`)}
                className={cn(
                  "data-table-row group cursor-pointer last:border-0",
                  showOverdueChrome && "border-l-2 border-l-status-pending",
                  isCancelled && "opacity-90",
                )}
              >
                <td className="block px-4 py-3 sm:hidden" colSpan={mobileColSpan}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="financial-id font-medium text-primary">
                          {inv.invoiceNumber}
                        </span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <div className="mt-0.5 truncate text-sm text-muted-foreground">
                        {inv.partyName ?? "—"}
                      </div>
                      {showVendorBillColumn && inv.originalBillNumber?.trim() ? (
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          Vendor bill {inv.originalBillNumber.trim()}
                        </div>
                      ) : null}
                      {showRefInvoiceColumn && (inv.sourceInvoiceId || inv.sourceInvoiceNumber) ? (
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">
                          Linked invoice{" "}
                          <LinkedInvoiceLink
                            invoiceId={inv.sourceInvoiceId}
                            invoiceNumber={inv.sourceInvoiceNumber}
                            className="text-muted-foreground"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : null}
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(inv.invoiceDate)}</span>
                        {showOverdueChrome && inv.overdueDays && inv.overdueDays > 0 && (
                          <span className="text-destructive">Overdue {inv.overdueDays}d</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-semibold tabular-nums">
                        {formatCurrency(inv.totalAmount ?? "0")}
                      </div>
                      {!isCancelled && !isFullyPaid && balanceDue > 0 && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Due {formatCurrency(balanceDue)}
                        </div>
                      )}
                      {isCancelled && (
                        <div className="mt-0.5 text-xs text-muted-foreground">Cancelled</div>
                      )}
                      {isFullyPaid && <div className="mt-0.5 text-xs text-status-paid">Paid</div>}
                    </div>
                  </div>
                </td>

                <td className="data-table-td hidden px-4 sm:table-cell sm:px-6">
                  <span className="financial-id font-medium text-primary group-hover:underline">
                    {inv.invoiceNumber}
                  </span>
                </td>
                <td className="data-table-td hidden sm:table-cell">{inv.partyName ?? "—"}</td>
                {showVendorBillColumn && (
                  <td className="data-table-td hidden max-w-[10rem] truncate text-muted-foreground lg:table-cell">
                    {inv.originalBillNumber?.trim() || "—"}
                  </td>
                )}
                {showRefInvoiceColumn && (
                  <td className="data-table-td hidden max-w-[10rem] truncate text-muted-foreground lg:table-cell">
                    <LinkedInvoiceLink
                      invoiceId={inv.sourceInvoiceId}
                      invoiceNumber={inv.sourceInvoiceNumber}
                      className="text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                <td className="data-table-td hidden text-muted-foreground sm:table-cell">
                  {formatDate(inv.invoiceDate)}
                </td>
                <td className="data-table-td hidden text-muted-foreground md:table-cell">
                  <div className="flex flex-col">
                    <span>{formatDate(inv.dueDate)}</span>
                    {showOverdueChrome && inv.overdueDays !== undefined && inv.overdueDays > 0 && (
                      <span className="text-xs text-destructive">Overdue {inv.overdueDays}d</span>
                    )}
                  </div>
                </td>
                <td className="data-table-td data-table-col-numeric hidden font-medium sm:table-cell">
                  {formatCurrency(inv.totalAmount ?? "0")}
                </td>
                <td
                  className={cn(
                    "data-table-td data-table-col-numeric hidden font-medium md:table-cell",
                    isFullyPaid && "text-status-paid",
                    showOverdueChrome && "text-destructive",
                    isCancelled && "text-muted-foreground",
                  )}
                >
                  {isCancelled ? "—" : isFullyPaid ? "Paid" : formatCurrency(balanceDue)}
                </td>
                <td className="data-table-td hidden text-center sm:table-cell">
                  <StatusBadge status={inv.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataTableRoot>
  );
}
