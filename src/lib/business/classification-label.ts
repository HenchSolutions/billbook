import type { BusinessClassificationOption } from "@/types/auth";

/** Title-style label for combobox rows (matches profile business / industry type UI). */
export function toClassificationLabel(value: string): string {
  const s = value.trim();
  if (!s) return "";
  return s.replace(/(^|[\s\-_/])([a-z])/g, (_, p1: string, p2: string) => {
    return `${p1}${p2.toUpperCase()}`;
  });
}

/** If `raw` matches a catalog option (case-insensitive), return the same label shown in the list. */
export function resolveClassificationFormValue(
  raw: string | null | undefined,
  options: BusinessClassificationOption[] | undefined,
): string {
  const t = (raw ?? "").trim();
  if (!t || !options?.length) return t;
  const hit = options.find((o) => o.name.trim().toLowerCase() === t.toLowerCase());
  if (!hit) return t;
  return toClassificationLabel(hit.name);
}
