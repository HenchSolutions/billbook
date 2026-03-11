import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types/invoice";

const METHOD_STYLES: Record<string, string> = {
  CASH: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UPI: "bg-blue-50 text-blue-700 border-blue-200",
  CHEQUE: "bg-amber-50 text-amber-700 border-amber-200",
  BANK_TRANSFER: "bg-purple-50 text-purple-700 border-purple-200",
  CARD: "bg-sky-50 text-sky-700 border-sky-200",
};

interface InvoicePaymentsTableProps {
  payments: Payment[];
}

export function InvoicePaymentsTable({ payments }: InvoicePaymentsTableProps) {
  if (payments.length === 0) return null;
  const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">Payments</CardTitle>
          {payments.length > 1 && (
            <span className="text-sm font-semibold tabular-nums text-emerald-600">
              {formatCurrency(totalPaid)} total
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="data-table-container">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">Method</th>
                <th className="px-3 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className={METHOD_STYLES[p.paymentMethod] ?? ""}>
                      {p.paymentMethod.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-emerald-600">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {p.referenceNumber ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
