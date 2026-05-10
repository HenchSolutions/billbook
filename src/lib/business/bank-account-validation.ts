/** Backend-aligned account number: digits only, length 6–34 */
export const BANK_ACCOUNT_NUMBER_REGEX = /^\d{6,34}$/;

/** IFSC: 11 alphanumeric (normalized uppercase) */
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function normalizeBankAccountDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export function normalizeIfsc(input: string): string {
  return input.replace(/\s/g, "").toUpperCase();
}

export function isValidBankAccountNumberDigits(digits: string): boolean {
  return BANK_ACCOUNT_NUMBER_REGEX.test(digits);
}

export function isValidIfsc(code: string): boolean {
  return IFSC_REGEX.test(normalizeIfsc(code));
}

/** Mask for lists — last 4 digits */
export function maskBankAccountNumber(accountNumber: string): string {
  const d = normalizeBankAccountDigits(accountNumber);
  if (d.length <= 4) return "••••";
  return `••••${d.slice(-4)}`;
}
