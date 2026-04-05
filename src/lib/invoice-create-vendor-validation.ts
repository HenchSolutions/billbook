import { parseISODateString } from "@/lib/date";
import { isPurchaseVendorBillMetaType } from "@/lib/invoice";
import type { InvoiceType } from "@/types/invoice";

/** Validates optional vendor bill metadata on purchase invoices. */
export function validatePurchaseVendorBillFields(
  invoiceType: InvoiceType,
  originalBillNumber: string,
  originalBillDate: string,
  paymentTermsDays: string,
): string | null {
  if (!isPurchaseVendorBillMetaType(invoiceType)) return null;
  if (originalBillNumber.trim().length > 100) {
    return "Original bill no. must be at most 100 characters.";
  }
  const obd = originalBillDate.trim().slice(0, 10);
  if (obd !== "" && !parseISODateString(obd)) {
    return "Enter a valid original bill date.";
  }
  const raw = paymentTermsDays.trim();
  if (raw === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || String(n) !== raw || n < 0 || n > 3650) {
    return "Payment terms must be a whole number from 0 to 3650.";
  }
  return null;
}
