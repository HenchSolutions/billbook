import { InvoiceCreatePage } from "@/components/invoices/InvoiceCreatePage";
import type { InvoiceType } from "@/types/invoice";

function normalizeInvoiceType(value: string | undefined): InvoiceType {
  switch (value) {
    case "SALE_INVOICE":
    case "SALE_RETURN":
    case "PURCHASE_INVOICE":
    case "PURCHASE_RETURN":
      return value;
    default:
      return "SALE_INVOICE";
  }
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const invoiceType = normalizeInvoiceType(params.type);

  return <InvoiceCreatePage initialType={invoiceType} />;
}
