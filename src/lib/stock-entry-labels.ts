import type { StockEntrySource } from "@/types/item";

/** Table / compact display */
export function stockEntrySourceShortLabel(
  entrySource: StockEntrySource | null | undefined,
): string {
  if (entrySource === "PURCHASE_INVOICE") return "Purchase invoice";
  return "Manual";
}

/** Detail sheet / tooltips */
export function stockEntrySourceFullLabel(
  entrySource: StockEntrySource | null | undefined,
): string {
  if (entrySource === "PURCHASE_INVOICE") return "From purchase invoice";
  return "Added manually";
}
