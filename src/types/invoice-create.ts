import type { Item, StockEntry } from "@/types/item";

export interface InvoiceLineDraft {
  id: string;
  item: Item | null;
  stockEntryId: number | null;
  /** Free text from vendor bill (PURCHASE_INVOICE without batch); optional override when batch linked. */
  itemName: string;
  /** Optional HSN/SAC override or vendor-line codes (purchase). */
  hsnCode: string;
  sacCode: string;
  quantity: string;
  unitPrice: string;
  /** Purchase invoice: intended retail/selling rate per unit (optional; sent to API to update stock). */
  sellingPrice?: string;
  discountPercent: string;
  discountAmount: string;
  cgstRate: string;
  sgstRate: string;
  igstRate: string;
  /** Original sale line id (`invoice_items.id`) when this return is linked to a source `SALE_INVOICE`. */
  sourceInvoiceItemId?: number;
  /** Original qty on the source invoice line (display). */
  soldQuantity?: string;
  /**
   * Max qty returnable now on this line (from GET `quantityReturnableRemaining`; includes other finalized returns).
   * Client-side cap before submit; falls back to `soldQuantity` when omitted.
   */
  remainingReturnableQty?: string;
  /** When false, line is excluded from the return document and totals. */
  selectedForReturn?: boolean;
}

export interface StockChoice {
  entry: StockEntry;
  item: Item;
  availableQty: number;
  usedQty: number;
  remainingQty: number;
  enabledForSelection: boolean;
}

export interface StockLineIssue {
  lineId: string;
  entryId: number;
  itemName: string;
  selectedQty: number;
  availableQty: number;
  suggestedQty: number;
  message: string;
}
