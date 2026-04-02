/**
 * Item / stock API path, response normalizers, and imperative fetches used by item hooks.
 * Not React hooks — keep under `lib/` so `hooks/` stays hook-oriented.
 */
import { api } from "@/api";
import { normalizeItemType } from "@/types/item";
import type { Item, StockEntry } from "@/types/item";

export const ITEMS_API_BASE = "/items";

export function normalizeItem(item: Item): Item {
  return {
    ...item,
    type: normalizeItemType(item.type),
  };
}

export function normalizeStockEntry(entry: StockEntry): StockEntry {
  return {
    ...entry,
    itemType: entry.itemType ? normalizeItemType(entry.itemType) : entry.itemType,
  };
}

export async function getStockEntryById(entryId: number): Promise<StockEntry> {
  const res = await api.get<StockEntry>(`${ITEMS_API_BASE}/stock-entries/${entryId}`);
  return normalizeStockEntry(res.data);
}
