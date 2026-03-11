import { InvoicesByTypePage } from "@/components/invoices/InvoicesByTypePage";

export default function SalesInvoicesPage() {
  return (
    <InvoicesByTypePage
      invoiceType="SALE_INVOICE"
      title="Sales Invoices"
      description="Track outgoing invoices billed to customers"
      createLabel="New Sales Invoice"
    />
  );
}
