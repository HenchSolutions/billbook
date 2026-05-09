import { InvoicesByTypePage } from "@/components/invoices/InvoicesByTypePage";

export default function PurchaseReturnPage() {
  return (
    <InvoicesByTypePage
      invoiceType="PURCHASE_RETURN"
      title="Purchase Returns"
      createLabel="New Purchase Return"
    />
  );
}
