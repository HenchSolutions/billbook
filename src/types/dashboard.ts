export interface SalesPurchaseByMonth {
  month: string;
  sales: string | number;
  purchase: string | number;
}

export interface TopVendor {
  partyId: number;
  partyName: string;
  totalPayable: string | number;
  documentCount?: number;
}

export interface DashboardRecentLedgerRow {
  id?: number | string;
  occurredAt: string;
  entryType: string;
  partyName: string;
  amount: string | number;
  mode: string | null;
}

export interface DashboardStockPulse {
  lowStockCount: number;
  outOfStockCount: number;
  deadStockCount: number;
  fastMovingCount: number;
}

/** Home dashboard scope chips — maps to {@link BusinessDashboardQueryParams} for API calls. */
export type DashboardPeriodMode = "monthly" | "overall" | "custom";

/** Query params for GET `/business/dashboard` (maps to TanStack cache keys). */
export type BusinessDashboardQueryParams =
  | { filter: "monthly" }
  | { filter: "overall" }
  | { filter: "custom"; startDate: string; endDate: string };

export type DashboardFilterKind = "monthly" | "overall" | "custom";

export interface DashboardData {
  business: DashboardBusiness;
  totalRevenue: string | number;
  totalReceivables?: string | number | null;
  topCustomers: TopCustomer[];
  topCustomersByReceivable?: TopCustomer[];

  /** Echo from API — `custom` when period KPIs use `periodStart`–`periodEnd`. */
  filter?: DashboardFilterKind | null;
  /** Set when `filter === "custom"`; otherwise typically null. */
  periodStart?: string | null;
  periodEnd?: string | null;
  snapshotDate?: string | null;
  /** Optional hint for chart rendering / labels (e.g. monthly bars). */
  chartSeriesKind?: "monthly-bars" | string | null;
  /** Trailing window for chart months: 12 (monthly), 36 (overall), null (custom range). */
  chartTrailingMonths?: 12 | 36 | null;
  todaySales?: string | number | null;
  monthSales?: string | number | null;
  totalPayables?: string | number | null;
  overdueReceivables?: string | number | null;
  overduePayables?: string | number | null;
  cashAndBankBalance?: string | number | null;
  monthProfit?: string | number | null;
  salesVsPurchaseByMonth?: SalesPurchaseByMonth[];
  topVendors?: TopVendor[];
  recentLedgerActivity?: DashboardRecentLedgerRow[];
  stockPulse?: DashboardStockPulse | null;
  summaryPurchase?: string | number | null;
  grossMarginPercent?: string | number | null;
}

export interface DashboardBusiness {
  id: number;
  name: string;
  gstin: string | null;
  taxType: string;
}

export interface TopCustomer {
  partyId: number;
  partyName: string;
  totalRevenue?: string | number;
  invoiceCount?: number;
  totalReceivable?: string | number;
  totalOutstanding?: string | number;
}
