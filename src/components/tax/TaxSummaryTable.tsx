import { DataTableRoot } from "@/components/ui/data-table";
import { formatMonthYear } from "@/lib/core/utils";

interface MonthlyTaxRow {
  month: string;
  cgst: string;
  sgst: string;
  igst: string;
  totalTax: string;
  totalAmount: string;
  invoiceCount?: number;
}

interface TaxSummaryTableProps {
  rows: MonthlyTaxRow[];
  totalCgst?: string;
  totalSgst?: string;
  totalIgst?: string;
  totalTax: string;
  totalAmount: string;
  invoiceCount: number;
}

export function TaxSummaryTable({
  rows,
  totalCgst,
  totalSgst,
  totalIgst,
  totalTax,
  totalAmount,
  invoiceCount,
}: TaxSummaryTableProps) {
  return (
    <DataTableRoot density="default">
      <table className="data-table">
        <thead className="data-table-head-sticky">
          <tr>
            <th className="data-table-th px-4 sm:px-6">Month</th>
            <th className="data-table-th data-table-col-numeric hidden md:table-cell">CGST</th>
            <th className="data-table-th data-table-col-numeric hidden md:table-cell">SGST</th>
            <th className="data-table-th data-table-col-numeric hidden md:table-cell">IGST</th>
            <th className="data-table-th data-table-col-numeric">Total Tax</th>
            <th className="data-table-th data-table-col-numeric">Total Amount</th>
            <th className="data-table-th data-table-col-numeric sm:px-6">Invoices</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month} className="data-table-row last:border-0">
              <td className="data-table-td px-4 font-medium sm:px-6">
                {formatMonthYear(row.month)}
              </td>
              <td className="data-table-td data-table-col-numeric hidden md:table-cell">
                ₹{row.cgst}
              </td>
              <td className="data-table-td data-table-col-numeric hidden md:table-cell">
                ₹{row.sgst}
              </td>
              <td className="data-table-td data-table-col-numeric hidden md:table-cell">
                ₹{row.igst}
              </td>
              <td className="data-table-td data-table-col-numeric font-medium">₹{row.totalTax}</td>
              <td className="data-table-td data-table-col-numeric">₹{row.totalAmount}</td>
              <td className="data-table-td data-table-col-numeric sm:px-6">{row.invoiceCount}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/30 font-medium">
            <td className="data-table-td px-4 sm:px-6">Total</td>
            <td className="data-table-td data-table-col-numeric hidden md:table-cell">
              ₹{totalCgst ?? "0"}
            </td>
            <td className="data-table-td data-table-col-numeric hidden md:table-cell">
              ₹{totalSgst ?? "0"}
            </td>
            <td className="data-table-td data-table-col-numeric hidden md:table-cell">
              ₹{totalIgst ?? "0"}
            </td>
            <td className="data-table-td data-table-col-numeric">₹{totalTax}</td>
            <td className="data-table-td data-table-col-numeric">₹{totalAmount}</td>
            <td className="data-table-td data-table-col-numeric sm:px-6">{invoiceCount}</td>
          </tr>
        </tfoot>
      </table>
    </DataTableRoot>
  );
}
