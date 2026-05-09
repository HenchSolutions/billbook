"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ErrorBanner from "@/components/ErrorBanner";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { EMPTY_DASHBOARD } from "@/lib/business/dashboard";
import { getDashboardCustomRangeSeedIso } from "@/lib/business/dashboard-home";
import { useDashboard } from "@/hooks/use-business";
import { useDateRange } from "@/hooks/use-date-range";
import { useCanCreateInvoice } from "@/hooks/use-can-create-invoice";
import { DashboardHomeHeader } from "@/components/dashboard/home/DashboardHomeHeader";
import { DashboardHomeKpis } from "@/components/dashboard/home/DashboardHomeKpis";
import { DashboardHomeReceivablesPayables } from "@/components/dashboard/home/DashboardHomeReceivablesPayables";
import { DashboardHomeStockPulse } from "@/components/dashboard/home/DashboardHomeStockPulse";
import { DashboardHomeLedgerTable } from "@/components/dashboard/home/DashboardHomeLedgerTable";
import { MAX_REPORT_DATE_RANGE_MONTHS } from "@/constants";
import type {
  BusinessDashboardQueryParams,
  DashboardData,
  DashboardPeriodMode,
} from "@/types/dashboard";

const DashboardHomeSalesPurchaseChart = dynamic(
  () =>
    import("@/components/dashboard/home/DashboardHomeSalesPurchaseChart").then((m) => ({
      default: m.DashboardHomeSalesPurchaseChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[min(320px,55vw)] min-h-[240px] animate-pulse rounded-lg border border-border/60 bg-muted/40"
        aria-busy="true"
        aria-label="Loading chart"
      />
    ),
  },
);

export default function DashboardPageClient() {
  const [periodMode, setPeriodMode] = useState<DashboardPeriodMode>("monthly");

  /** Empty until the user opens the custom calendar; then we seed FY 1 Apr → today (clamped). */
  const customRange = useDateRange({
    maxMonths: MAX_REPORT_DATE_RANGE_MONTHS,
    defaultStartDate: "",
    defaultEndDate: "",
  });

  const seedCustomRangeIfEmpty = useCallback(() => {
    const start = customRange.startDate?.trim() ?? "";
    const end = customRange.endDate?.trim() ?? "";
    if (start && end) return;
    const { startDate, endDate } = getDashboardCustomRangeSeedIso(MAX_REPORT_DATE_RANGE_MONTHS);
    customRange.setStartDate(startDate);
    customRange.setEndDate(endDate);
  }, [customRange]);

  const dashboardParams = useMemo((): BusinessDashboardQueryParams => {
    if (periodMode === "custom") {
      return {
        filter: "custom",
        startDate: customRange.validStartDate || customRange.startDate,
        endDate: customRange.validEndDate || customRange.endDate,
      };
    }
    if (periodMode === "overall") return { filter: "overall" };
    return { filter: "monthly" };
  }, [
    periodMode,
    customRange.startDate,
    customRange.endDate,
    customRange.validStartDate,
    customRange.validEndDate,
  ]);

  const fetchEnabled = periodMode !== "custom" || customRange.isValid;

  const {
    data: dashboard,
    isPending,
    error,
  } = useDashboard(dashboardParams, {
    enabled: fetchEnabled,
  });
  const { canCreateInvoice } = useCanCreateInvoice();

  const lastSuccessfulDashboardRef = useRef<DashboardData | null>(null);
  useEffect(() => {
    if (dashboard) lastSuccessfulDashboardRef.current = dashboard;
  }, [dashboard]);

  const displayDashboard = useMemo(() => {
    if (periodMode === "custom" && !customRange.isValid) {
      return lastSuccessfulDashboardRef.current ?? EMPTY_DASHBOARD;
    }
    return dashboard ?? EMPTY_DASHBOARD;
  }, [periodMode, customRange.isValid, dashboard]);

  const showSkeleton = isPending && fetchEnabled;

  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  if (error && !dashboard) {
    return (
      <div className="page-container animate-fade-in">
        <ErrorBanner error={error} fallbackMessage="Failed to load dashboard data." />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <ErrorBanner error={error} fallbackMessage="Failed to load dashboard data." />

      {periodMode === "custom" && !customRange.isValid ? (
        <p className="mb-3 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground sm:text-sm">
          Pick <span className="font-medium text-foreground">From</span> and{" "}
          <span className="font-medium text-foreground">To</span> (max{" "}
          {MAX_REPORT_DATE_RANGE_MONTHS} months). Numbers below use your last loaded period until
          both dates are set.
        </p>
      ) : null}

      <div className="space-y-5 lg:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <DashboardHomeHeader
            dashboard={displayDashboard}
            canCreateInvoice={canCreateInvoice}
            periodMode={periodMode}
            onPeriodModeChange={setPeriodMode}
            onSeedCustomRangeIfEmpty={seedCustomRangeIfEmpty}
            customRange={{
              startDate: customRange.startDate,
              endDate: customRange.endDate,
              setStartDate: customRange.setStartDate,
              setEndDate: customRange.setEndDate,
              error: customRange.error,
            }}
          />
          <DashboardHomeKpis dashboard={displayDashboard} periodMode={periodMode} />
        </div>
        <DashboardHomeSalesPurchaseChart dashboard={displayDashboard} periodMode={periodMode} />
        <DashboardHomeReceivablesPayables dashboard={displayDashboard} />
        <DashboardHomeStockPulse dashboard={displayDashboard} />
        <DashboardHomeLedgerTable dashboard={displayDashboard} />
      </div>
    </div>
  );
}
