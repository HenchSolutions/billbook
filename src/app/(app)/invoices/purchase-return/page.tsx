import { InvoicesByTypePage } from "@/components/invoices/InvoicesByTypePage";

export default function PurchaseReturnPage() {
  return (
    <InvoicesByTypePage
      invoiceType="PURCHASE_RETURN"
      title="Purchase Returns"
      description="Manage purchase return documents and adjustments"
      createLabel="New Purchase Return"
    />
  );
}
