import { InvoicesByTypePage } from "@/components/invoices/InvoicesByTypePage";

export default function SalesInvoicesPage() {
  return (
    <InvoicesByTypePage
      invoiceType="SALE_INVOICE"
      title="Sales Invoices"
      createLabel="New Sales Invoice"
    />
  );
}
