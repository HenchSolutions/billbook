/** True when `aria-invalid` is set for validation error (boolean or React ARIA string). */
export function isAriaInvalid(
  value: boolean | undefined | "true" | "false" | "grammar" | "spelling",
): boolean {
  return value === true || value === "true";
}

/** Border + focus ring for invalid text fields (Input, Textarea). */
export function invalidTextControlClass(invalid: boolean): string | undefined {
  return invalid
    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40"
    : undefined;
}

/** Border + focus ring for invalid Select trigger. */
export function invalidSelectTriggerClass(invalid: boolean): string | undefined {
  return invalid
    ? "border-destructive focus:border-destructive focus:ring-destructive/40"
    : undefined;
}
