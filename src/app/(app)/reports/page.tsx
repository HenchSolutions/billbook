"use client";

import DateRangePicker from "@/components/DateRangePicker";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import { ReportsDashboardSection } from "@/components/reports/ReportsDashboardSection";
import { ReportTabSkeleton } from "@/components/skeletons/ReportTabSkeleton";
import { useReportsDashboard } from "@/hooks/use-reports";
import { useDateRange } from "@/hooks/use-date-range";
import { MAX_REPORT_DATE_RANGE_MONTHS } from "@/constants";

export default function ReportsPage() {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    error: dateRangeError,
    validStartDate,
    validEndDate,
  } = useDateRange({ maxMonths: MAX_REPORT_DATE_RANGE_MONTHS });

  const { data, isPending, error } = useReportsDashboard(validStartDate, validEndDate);

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Reports"
        description="Set a range for activity totals, then open a register to review or export."
      />

      <ErrorBanner error={error} fallbackMessage="Failed to load dashboard" />

      <div className="mb-8 space-y-2">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          error={dateRangeError}
        />
        <p className="text-xs text-muted-foreground">
          Range is limited to {MAX_REPORT_DATE_RANGE_MONTHS} months. Change dates anytime — the
          dashboard refreshes automatically.
        </p>
      </div>

      {isPending ? (
        <ReportTabSkeleton height="h-96" />
      ) : data ? (
        <ReportsDashboardSection data={data} />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Select a valid date range (max {MAX_REPORT_DATE_RANGE_MONTHS} months) to load the
          dashboard.
        </p>
      )}
    </div>
  );
}
