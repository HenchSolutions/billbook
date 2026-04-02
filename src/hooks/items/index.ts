export {
  useCategories,
  useCreateCategory,
  useUnits,
  useCreateUnit,
  type UnitsResponse,
} from "./use-item-catalog";
export {
  useItems,
  useItem,
  useCreateItem,
  useUpdateItem,
  useSetItemActive,
} from "./use-items-core";
export {
  useStockEntries,
  useStockEntry,
  useStockEntriesByIds,
  useCreateStockEntry,
  useUpdateStockEntry,
  useStockList,
  useAdjustStock,
  useItemLedger,
} from "./use-stock";
export { getStockEntryById, normalizeItem, normalizeStockEntry } from "@/lib/item-api";
