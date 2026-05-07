import { DataTableRoot } from "@/components/ui/data-table";
import { formatDate } from "@/lib/core/utils";

interface ItemizedTaxRow {
  invoiceId: number;
  invoiceNumber: string;
  partyName: string;
  invoiceDate: string;
  taxableAmount: string;
  cgst: string;
  sgst: string;
  igst: string;
  totalTax: string;
}

export function TaxItemizedTable({ rows }: { rows: ItemizedTaxRow[] }) {
  return (
    <DataTableRoot density="default">
      <table className="data-table">
        <thead className="data-table-head-sticky">
          <tr>
            <th className="data-table-th px-4 sm:px-6">Invoice</th>
            <th className="data-table-th">Party</th>
            <th className="data-table-th hidden md:table-cell">Date</th>
            <th className="data-table-th data-table-col-numeric">Taxable</th>
            <th className="data-table-th data-table-col-numeric hidden lg:table-cell">CGST</th>
            <th className="data-table-th data-table-col-numeric hidden lg:table-cell">SGST</th>
            <th className="data-table-th data-table-col-numeric hidden lg:table-cell">IGST</th>
            <th className="data-table-th data-table-col-numeric sm:px-6">Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.invoiceId} className="data-table-row last:border-0">
              <td className="data-table-td px-4 font-medium text-primary sm:px-6">
                <span className="financial-id">{row.invoiceNumber}</span>
              </td>
              <td className="data-table-td">{row.partyName}</td>
              <td className="data-table-td hidden text-muted-foreground md:table-cell">
                {formatDate(row.invoiceDate)}
              </td>
              <td className="data-table-td data-table-col-numeric">₹{row.taxableAmount}</td>
              <td className="data-table-td data-table-col-numeric hidden lg:table-cell">
                ₹{row.cgst}
              </td>
              <td className="data-table-td data-table-col-numeric hidden lg:table-cell">
                ₹{row.sgst}
              </td>
              <td className="data-table-td data-table-col-numeric hidden lg:table-cell">
                ₹{row.igst}
              </td>
              <td className="data-table-td data-table-col-numeric font-medium sm:px-6">
                ₹{row.totalTax}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableRoot>
  );
}
