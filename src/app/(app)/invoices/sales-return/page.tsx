import { InvoicesByTypePage } from "@/components/invoices/InvoicesByTypePage";

export default function SalesReturnPage() {
  return (
    <InvoicesByTypePage
      invoiceType="SALE_RETURN"
      title="Sales Returns"
      createLabel="New Sales Return"
    />
  );
}
