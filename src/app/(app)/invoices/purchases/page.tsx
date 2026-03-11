import { InvoicesByTypePage } from "@/components/invoices/InvoicesByTypePage";

export default function PurchaseInvoicesPage() {
  return (
    <InvoicesByTypePage
      invoiceType="PURCHASE_INVOICE"
      title="Purchase Invoices"
      description="Track purchase bills from vendors"
      createLabel="New Purchase Invoice"
    />
  );
}
