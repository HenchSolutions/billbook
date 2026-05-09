import { InvoicesByTypePage } from "@/components/invoices/InvoicesByTypePage";

export default function PurchaseInvoicesPage() {
  return (
    <InvoicesByTypePage
      invoiceType="PURCHASE_INVOICE"
      title="Purchase Invoices"
      createLabel="New Purchase Invoice"
    />
  );
}
