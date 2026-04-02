/** Mirrors server `MAX_REPORT_DATE_RANGE_MONTHS` — use with `useDateRange({ maxMonths })`. */
export const MAX_REPORT_DATE_RANGE_MONTHS = 12;

export const DEFAULT_REPORT_LIMIT = 2000;
export const MAX_REPORT_LIMIT = 5000;

export function clampReportLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_REPORT_LIMIT;
  return Math.min(MAX_REPORT_LIMIT, Math.max(1, Math.floor(value)));
}
