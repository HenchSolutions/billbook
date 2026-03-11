import { InvoicesByTypePage } from "@/components/invoices/InvoicesByTypePage";

export default function SalesReturnPage() {
  return (
    <InvoicesByTypePage
      invoiceType="SALE_RETURN"
      title="Sales Returns"
      description="Manage sales return documents and adjustments"
      createLabel="New Sales Return"
    />
  );
}
