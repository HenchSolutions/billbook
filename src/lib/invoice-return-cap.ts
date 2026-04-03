import { formatQty, toNum } from "@/lib/invoice-create";
import type { InvoiceItem } from "@/types/invoice";
import type { InvoiceLineDraft } from "@/types/invoice-create";

type LineCap = Pick<InvoiceLineDraft, "quantity" | "remainingReturnableQty" | "soldQuantity">;

/**
 * When opening a linked return from a source invoice line: default return qty to what’s still
 * returnable (API), not the original sold qty — avoids starting over-cap when partial returns exist.
 */
export function defaultLinkedReturnQuantity(
  invoiceItem: Pick<InvoiceItem, "quantity" | "quantityReturnableRemaining">,
): string {
  const rem = invoiceItem.quantityReturnableRemaining?.trim();
  if (rem !== undefined && rem !== "") return rem;
  return invoiceItem.quantity;
}

/** If current qty exceeds remaining cap string, clamp to cap (formatted). */
export function clampQuantityToRemainingCap(quantityStr: string, remainingStr: string): string {
  const cap = toNum(remainingStr.trim());
  const q = toNum(quantityStr);
  if (!Number.isFinite(cap) || cap < 0) return quantityStr;
  if (!Number.isFinite(q)) return quantityStr;
  if (q <= cap + 1e-9) return quantityStr;
  return formatQty(Math.min(q, cap));
}

/** Max returnable qty for this line, or null if unknown (no cap client-side). */
export function getReturnQuantityCap(line: LineCap): number | null {
  const capStr = line.remainingReturnableQty?.trim() || line.soldQuantity?.trim() || "";
  if (capStr === "") return null;
  const cap = toNum(capStr);
  return cap > 0 && Number.isFinite(cap) ? cap : null;
}

export function isReturnQuantityOverCap(line: LineCap): boolean {
  const cap = getReturnQuantityCap(line);
  if (cap == null) return false;
  const ret = toNum(line.quantity);
  return ret > cap + 1e-9;
}
