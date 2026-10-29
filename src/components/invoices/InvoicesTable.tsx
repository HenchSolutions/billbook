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

const pad = "px-4 sm:px-5";

export function InvoicesTable({ invoices, invoiceType }: InvoicesTableProps) {
  const router = useRouter();
  const showVendorBillColumn =
    invoiceType === "PURCHASE_INVOICE" || invoiceType === "PURCHASE_RETURN";
  const showRefInvoiceColumn = invoiceType === "SALE_RETURN" || invoiceType === "PURCHASE_RETURN";
  const extraColCount = (showVendorBillColumn ? 1 : 0) + (showRefInvoiceColumn ? 1 : 0);
  const mobileColSpan = 7 + extraColCount;

  // Even column share across the row (all desktop columns always visible together).
  const idW = extraColCount === 0 ? "w-[14%]" : extraColCount === 1 ? "w-[12%]" : "w-[11%]";
  const partyW = extraColCount === 0 ? "w-[20%]" : extraColCount === 1 ? "w-[14%]" : "w-[12%]";
  const midW = extraColCount === 0 ? "w-[12%]" : extraColCount === 1 ? "w-[11%]" : "w-[10%]";
  const moneyW = extraColCount === 0 ? "w-[14%]" : extraColCount === 1 ? "w-[13%]" : "w-[12%]";
  const statusW = extraColCount === 0 ? "w-[14%]" : extraColCount === 1 ? "w-[13%]" : "w-[13%]";
  const extraW = extraColCount === 2 ? "w-[10%]" : "w-[12%]";

  return (
    <DataTableRoot density="default" className="-mx-1 px-1 sm:mx-0 sm:px-0">
      <table
        className="data-table w-full table-fixed"
        style={{ width: "100%", minWidth: "880px" }}
        role="table"
        aria-label="Invoices list"
      >
        <thead className="data-table-head-sticky hidden sm:table-header-group">
          <tr>
            <th scope="col" className={cn("data-table-th", pad, idW)}>
              Invoice #
            </th>
            <th scope="col" className={cn("data-table-th", pad, partyW)}>
              Party
            </th>
            {showVendorBillColumn ? (
              <th scope="col" className={cn("data-table-th", pad, extraW)}>
                Vendor bill
              </th>
            ) : null}
            {showRefInvoiceColumn ? (
              <th scope="col" className={cn("data-table-th", pad, extraW)}>
                Linked Invoice
              </th>
            ) : null}
            <th scope="col" className={cn("data-table-th", pad, midW)}>
              Date
            </th>
            <th scope="col" className={cn("data-table-th", pad, midW)}>
              Due Date
            </th>
            <th scope="col" className={cn("data-table-th", pad, moneyW)}>
              Amount
            </th>
            <th scope="col" className={cn("data-table-th", pad, moneyW)}>
              Balance Due
            </th>
            <th scope="col" className={cn("data-table-th", pad, statusW)}>
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
                <td className={cn("block py-3 sm:hidden", pad)} colSpan={mobileColSpan}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="financial-id font-medium text-primary">
                          {inv.invoiceNumber}
                        </span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <div className="mt-0.5 truncate text-sm text-muted-foreground">
                        {inv.partyName ?? "-"}
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

                <td className={cn("data-table-td hidden sm:table-cell", pad)}>
                  <span className="financial-id block truncate font-medium text-primary group-hover:underline">
                    {inv.invoiceNumber}
                  </span>
                </td>
                <td className={cn("data-table-td hidden truncate sm:table-cell", pad)}>
                  <span title={inv.partyName ?? undefined}>{inv.partyName ?? "-"}</span>
                </td>
                {showVendorBillColumn ? (
                  <td
                    className={cn(
                      "data-table-td hidden truncate text-muted-foreground sm:table-cell",
                      pad,
                    )}
                  >
                    {inv.originalBillNumber?.trim() || "-"}
                  </td>
                ) : null}
                {showRefInvoiceColumn ? (
                  <td
                    className={cn(
                      "data-table-td hidden truncate text-muted-foreground sm:table-cell",
                      pad,
                    )}
                  >
                    <LinkedInvoiceLink
                      invoiceId={inv.sourceInvoiceId}
                      invoiceNumber={inv.sourceInvoiceNumber}
                      className="text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                ) : null}
                <td
                  className={cn(
                    "data-table-td hidden truncate text-muted-foreground sm:table-cell",
                    pad,
                  )}
                >
                  {formatDate(inv.invoiceDate)}
                </td>
                <td className={cn("data-table-td hidden text-muted-foreground sm:table-cell", pad)}>
                  <div className="flex flex-col truncate">
                    <span className="truncate">{formatDate(inv.dueDate)}</span>
                    {showOverdueChrome && inv.overdueDays !== undefined && inv.overdueDays > 0 && (
                      <span className="truncate text-xs text-destructive">
                        Overdue {inv.overdueDays}d
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className={cn(
                    "data-table-td hidden truncate font-medium tabular-nums sm:table-cell",
                    pad,
                  )}
                >
                  {formatCurrency(inv.totalAmount ?? "0")}
                </td>
                <td
                  className={cn(
                    "data-table-td hidden truncate font-medium tabular-nums sm:table-cell",
                    pad,
                    isFullyPaid && "text-status-paid",
                    showOverdueChrome && "text-destructive",
                    isCancelled && "text-muted-foreground",
                  )}
                >
                  {isCancelled ? "-" : isFullyPaid ? "Paid" : formatCurrency(balanceDue)}
                </td>
                <td className={cn("data-table-td hidden sm:table-cell", pad)}>
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
