import type { DashboardData, DashboardBusiness } from "@/types/dashboard";

export const EMPTY_DASHBOARD: DashboardData = {
  business: { id: 0, name: "", gstin: null, taxType: "GST" } as DashboardBusiness,
  totalInvoices: 0,
  totalRevenue: 0,
  totalPaid: 0,
  totalOutstanding: 0,
  totalItems: 0,
  totalParties: 0,
  revenueByMonth: [],
  topItems: [],
  topCustomers: [],
  invoiceStatusBreakdown: [],
  paymentStatusBreakdown: [],
  recentInvoices: [],
};
