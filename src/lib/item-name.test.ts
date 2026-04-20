import assert from "node:assert/strict";
import test from "node:test";
import { ApiClientError } from "@/api/error";
import {
  isDuplicateItemName,
  isDuplicateItemNameApiError,
  normalizeItemName,
  normalizeItemNameForCompare,
} from "@/lib/item-name";
import type { Item } from "@/types/item";

const baseItem = {
  businessId: 1,
  type: "STOCK",
  hsnCode: null,
  sacCode: null,
  categoryId: 1,
  unit: "nos",
  description: null,
  cgstRate: null,
  sgstRate: null,
  igstRate: null,
  isActive: true,
  createdAt: "2026-04-20T00:00:00.000Z",
  updatedAt: "2026-04-20T00:00:00.000Z",
} satisfies Omit<Item, "id" | "name">;

function item(id: number, name: string): Item {
  return { id, name, ...baseItem };
}

test("normalizeItemName trims surrounding whitespace", () => {
  assert.equal(normalizeItemName("  Milk  "), "Milk");
  assert.equal(normalizeItemName("   \t\n "), "");
});

test("normalizeItemNameForCompare trims and lowercases", () => {
  assert.equal(normalizeItemNameForCompare("  Milk  "), "milk");
});

test("isDuplicateItemName treats case and whitespace variants as duplicates", () => {
  const items = [item(1, "Milk")];
  assert.equal(isDuplicateItemName(" milk ", items), true);
  assert.equal(isDuplicateItemName("MILK", items), true);
  assert.equal(isDuplicateItemName("Bread", items), false);
});

test("isDuplicateItemName excludes current item id in edit mode", () => {
  const items = [item(1, "Milk"), item(2, "Bread")];
  assert.equal(isDuplicateItemName(" milk ", items, 1), false);
  assert.equal(isDuplicateItemName(" bread ", items, 1), true);
});

test("isDuplicateItemNameApiError detects 409 first", () => {
  const err = new ApiClientError("anything", 409);
  assert.equal(isDuplicateItemNameApiError(err), true);
});

test("isDuplicateItemNameApiError falls back to message matching", () => {
  assert.equal(isDuplicateItemNameApiError(new Error("Item with this name already exists")), true);
  assert.equal(
    isDuplicateItemNameApiError(new Error("An item with this name already exists.")),
    true,
  );
  assert.equal(isDuplicateItemNameApiError(new Error("Request failed (500)")), false);
});
