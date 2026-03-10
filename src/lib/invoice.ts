import type { Invoice, InvoiceType } from "@/types/invoice";

function parseAmount(value: string | null | undefined): number {
  const parsed = parseFloat((value ?? "0").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Use API dueAmount when valid; if backend returns 0 for unpaid invoices,
 * fall back to total - paid to keep UI balance accurate.
 */
export function getInvoiceBalanceDue(
  invoice: Pick<Invoice, "totalAmount" | "paidAmount" | "dueAmount">,
): number {
  const total = parseAmount(invoice.totalAmount);
  const paid = parseAmount(invoice.paidAmount);
  const computed = Math.max(0, total - paid);
  const due = parseAmount(invoice.dueAmount);

  // Prefer computed value when it indicates outstanding balance but API due is zero.
  if (computed > 0 && due <= 0) return computed;
  return Math.max(0, due || computed);
}

export const INVOICE_TYPE_OPTIONS: Array<{
  type: InvoiceType;
  path: string;
  label: string;
  shortLabel: string;
}> = [
  {
    type: "SALE_INVOICE",
    path: "/invoices/sales",
    label: "Sales Invoice",
    shortLabel: "Sales",
  },
  {
    type: "PURCHASE_INVOICE",
    path: "/invoices/purchases",
    label: "Purchase Invoice",
    shortLabel: "Purchase",
  },
  {
    type: "SALE_RETURN",
    path: "/invoices/sales-return",
    label: "Sales Return",
    shortLabel: "Sales Return",
  },
  {
    type: "PURCHASE_RETURN",
    path: "/invoices/purchase-return",
    label: "Purchase Return",
    shortLabel: "Purchase Return",
  },
];

export function isSalesFamily(type: InvoiceType): boolean {
  return type === "SALE_INVOICE" || type === "SALE_RETURN";
}
