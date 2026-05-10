import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableRoot } from "@/components/ui/data-table";
import TablePagination from "@/components/TablePagination";
import {
  receiptOpeningSettlementNum,
  receiptUnallocatedAmountNum,
} from "@/lib/receipts/receipt-amounts";
import { formatCurrency, formatDate } from "@/lib/core/utils";
import { PAYMENT_METHOD_LABEL, receiptPaymentMethodBadgeProps } from "@/constants/receipt-ui";
import type { ReceiptListItem } from "@/types/receipt";

interface ReceiptsTableProps {
  receipts: ReceiptListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function ReceiptsTable({
  receipts,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: ReceiptsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <DataTableRoot density="default" className="overflow-x-auto border-0 shadow-none">
          <table className="data-table">
            <thead className="data-table-head-sticky">
              <tr>
                <th className="data-table-th px-4">Receipt</th>
                <th className="data-table-th px-4">Party</th>
                <th className="data-table-th px-4">Date</th>
                <th className="data-table-th px-4">Method</th>
                <th className="data-table-th data-table-col-numeric px-4">Total</th>
                <th className="data-table-th data-table-col-numeric px-4">Opening tag</th>
                <th className="data-table-th data-table-col-numeric px-4">Unallocated</th>
                <th className="data-table-th px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => {
                const unalloc = receiptUnallocatedAmountNum(r);
                const openingTag = receiptOpeningSettlementNum(r);
                const canAllocate = unalloc > 0.001;
                const methodBadge = receiptPaymentMethodBadgeProps(r.paymentMethod);
                return (
                  <tr key={r.id} className="data-table-row last:border-0">
                    <td className="data-table-td px-4">
                      <Link
                        href={`/receipts/${r.id}`}
                        className="financial-id font-medium text-primary hover:underline"
                      >
                        {r.receiptNumber}
                      </Link>
                    </td>
                    <td className="data-table-td max-w-[180px] truncate px-4 text-muted-foreground">
                      {r.partyName ?? "—"}
                    </td>
                    <td className="data-table-td px-4 text-muted-foreground">
                      {formatDate(r.receivedAt || r.createdAt)}
                    </td>
                    <td className="data-table-td px-4">
                      <Badge
                        variant="outline"
                        className={methodBadge.className}
                        title={methodBadge.title}
                      >
                        {PAYMENT_METHOD_LABEL[r.paymentMethod] ??
                          r.paymentMethod.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="data-table-td data-table-col-numeric px-4 font-medium">
                      {formatCurrency(r.totalAmount)}
                    </td>
                    <td className="data-table-td data-table-col-numeric px-4 text-muted-foreground">
                      {openingTag > 0.001 ? (
                        <span className="font-medium text-foreground">
                          {formatCurrency(String(openingTag))}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="data-table-td data-table-col-numeric px-4">
                      {unalloc > 0.001 ? (
                        <span className="font-medium text-amber-700">
                          {formatCurrency(String(unalloc))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="data-table-td px-4 text-center">
                      {canAllocate ? (
                        <Button variant="default" size="sm" className="h-8" asChild>
                          <Link href={`/receipts/${r.id}#allocate`}>Allocate</Link>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-muted-foreground"
                          disabled
                          title="Nothing left to allocate"
                        >
                          Allocate
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableRoot>
        {totalPages > 1 && (
          <div className="border-t p-4">
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
