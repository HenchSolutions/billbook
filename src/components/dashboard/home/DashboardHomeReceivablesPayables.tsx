"use client";

import Link from "next/link";
import { Building2, Users } from "lucide-react";
import {
  fluidMetricShellClass,
  fluidRowAmountClass,
  fluidSectionStatClass,
} from "@/components/dashboard/dashboard-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/core/utils";
import type { DashboardData, TopCustomer, TopVendor } from "@/types/dashboard";
import { dashboardToNumber } from "@/lib/business/dashboard-home";
import { usePermissions } from "@/hooks/use-permissions";
import { PAGE } from "@/constants/page-access";

interface DashboardHomeReceivablesPayablesProps {
  dashboard: DashboardData;
}

export function DashboardHomeReceivablesPayables({
  dashboard,
}: DashboardHomeReceivablesPayablesProps) {
  const { can } = usePermissions();
  const canReportsHub = can(PAGE.reports);
  const canPayablesRegister = can(PAGE.reports_payables_register);
  const canParties = can(PAGE.parties);
  const canVendors = can(PAGE.vendors);

  const formatOptionalCurrency = (value: string | number | null | undefined) =>
    value != null && value !== "" ? formatCurrency(value) : "—";
  const receivables = dashboardToNumber(dashboard.totalReceivables);
  const overdueRec = dashboard.overdueReceivables;
  const payables = dashboard.totalPayables;
  const overduePay = dashboard.overduePayables;
  const customers: TopCustomer[] = Array.isArray(dashboard.topCustomers)
    ? dashboard.topCustomers
    : [];
  const showReceivableRanking =
    Array.isArray(dashboard.topCustomersByReceivable) &&
    dashboard.topCustomersByReceivable.length > 0 &&
    customers.every((c) => c.totalRevenue == null || c.totalRevenue === "");
  const vendors: TopVendor[] = Array.isArray(dashboard.topVendors) ? dashboard.topVendors : [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold tracking-tight">Receivables</CardTitle>
          {canReportsHub ? (
            <Link
              href="/reports/receivables-aging"
              className="shrink-0 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
            >
              Ageing report
            </Link>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-8">
            <div className={cn(fluidMetricShellClass, "min-w-[8rem] flex-1")}>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p
                className={cn(fluidSectionStatClass, "mt-2 text-emerald-800 dark:text-emerald-400")}
              >
                {formatCurrency(receivables)}
              </p>
            </div>
            <div className={cn(fluidMetricShellClass, "min-w-[8rem] flex-1")}>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className={cn(fluidSectionStatClass, "mt-2 text-status-overdue")}>
                {formatOptionalCurrency(overdueRec)}
              </p>
            </div>
          </div>
          <div className="border-t border-border/60 pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-semibold tracking-tight text-foreground">
                {showReceivableRanking ? "Top customers (receivable)" : "Top customers"}
              </p>
              {canParties ? (
                <Link
                  href="/parties"
                  className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
                >
                  Browse customers
                </Link>
              ) : null}
            </div>
            {customers.length > 0 ? (
              <ul className="space-y-2">
                {customers.slice(0, 6).map((c) => (
                  <li
                    key={c.partyId}
                    className={cn(
                      fluidMetricShellClass,
                      "flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 transition-colors hover:bg-muted/40",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate text-sm font-medium">{c.partyName}</span>
                    </span>
                    <span className={fluidRowAmountClass}>
                      {formatCurrency(
                        c.totalRevenue ?? c.totalReceivable ?? c.totalOutstanding ?? 0,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No ranked customers yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold tracking-tight">Payables</CardTitle>
          {canPayablesRegister ? (
            <Link
              href="/reports/payables-register"
              className="shrink-0 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
            >
              Payables register
            </Link>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-8">
            <div className={cn(fluidMetricShellClass, "min-w-[8rem] flex-1")}>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className={cn(fluidSectionStatClass, "mt-2 text-amber-900 dark:text-amber-400")}>
                {formatOptionalCurrency(payables)}
              </p>
            </div>
            <div className={cn(fluidMetricShellClass, "min-w-[8rem] flex-1")}>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className={cn(fluidSectionStatClass, "mt-2 text-status-overdue")}>
                {formatOptionalCurrency(overduePay)}
              </p>
            </div>
          </div>
          <div className="border-t border-border/60 pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-semibold tracking-tight text-foreground">Top vendors</p>
              {canVendors ? (
                <Link
                  href="/vendors"
                  className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
                >
                  Browse vendors
                </Link>
              ) : null}
            </div>
            {vendors.length > 0 ? (
              <ul className="space-y-2">
                {vendors.slice(0, 6).map((v) => (
                  <li
                    key={v.partyId}
                    className={cn(
                      fluidMetricShellClass,
                      "flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 transition-colors hover:bg-muted/40",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate text-sm font-medium">{v.partyName}</span>
                    </span>
                    <span className={fluidRowAmountClass}>{formatCurrency(v.totalPayable)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No vendor ranking data yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
