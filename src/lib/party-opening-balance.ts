/**
 * Party `openingBalance` from the API is a signed decimal string.
 * Form UX uses an unsigned amount + Debit/Credit instead of typing − manually.
 *
 * Convention: positive API value = debit balance, negative = credit balance
 * (matches prior behaviour of entering +amount vs −amount in one field).
 */

export type OpeningBalanceNature = "DEBIT" | "CREDIT";

/** True when a saved party already has opening balance on record (cannot be edited afterward). */
export function hasPersistedOpeningBalance(raw: string | null | undefined): boolean {
  return raw != null && String(raw).trim() !== "";
}

/** Normalise a non-negative number to a short decimal string for the amount field. */
function formatAbsForInput(n: number): string {
  const s = n.toFixed(2);
  if (s.endsWith(".00")) return s.slice(0, -3);
  if (s.endsWith("0")) return s.slice(0, -1);
  return s;
}

/** Parse API value into amount input + Dr/Cr for the form. */
export function openingBalanceFromApi(raw: string | null | undefined): {
  amount: string;
  nature: OpeningBalanceNature;
} {
  if (raw == null || String(raw).trim() === "") {
    return { amount: "", nature: "DEBIT" };
  }
  const n = parseFloat(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n)) {
    return { amount: "", nature: "DEBIT" };
  }
  if (n === 0) {
    return { amount: "0", nature: "DEBIT" };
  }
  const abs = Math.abs(n);
  const amount = formatAbsForInput(abs);
  return n > 0 ? { amount, nature: "DEBIT" } : { amount, nature: "CREDIT" };
}

/** Serialize form fields to the signed string the API expects. */
export function openingBalanceToApi(
  amount: string | undefined,
  nature: OpeningBalanceNature,
): string | undefined {
  const t = (amount ?? "").trim();
  if (t === "") return undefined;
  const n = parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return undefined;
  if (n === 0) return "0";
  return nature === "DEBIT" ? t : `-${t}`;
}
