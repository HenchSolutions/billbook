const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
const HSN_REGEX = /^[0-9]{4}([0-9]{2})?([0-9]{2})?$/;
const IN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export function isValidGstin(value: string | null | undefined): boolean {
  const normalized = value?.trim().toUpperCase() ?? "";
  if (!normalized) return false;
  return GSTIN_REGEX.test(normalized);
}

export function isValidPan(value: string | null | undefined): boolean {
  const normalized = value?.trim().toUpperCase() ?? "";
  if (!normalized) return false;
  return PAN_REGEX.test(normalized);
}

/** HSN accepts 4, 6, or 8 digits. */
export function isValidHsnCode(value: string | null | undefined): boolean {
  const normalized = value?.trim() ?? "";
  if (!normalized) return false;
  return HSN_REGEX.test(normalized);
}

export function isValidIndianPincode(value: string | null | undefined): boolean {
  const normalized = value?.trim() ?? "";
  if (!normalized) return false;
  return IN_PINCODE_REGEX.test(normalized);
}
