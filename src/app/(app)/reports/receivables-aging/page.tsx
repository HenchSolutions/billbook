"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import { ReportBackLink } from "@/components/reports/ReportBackLink";
import { ReportCsvButton } from "@/components/reports/ReportCsvButton";
import { ReportLimitInput } from "@/components/reports/ReportLimitInput";
import { ReceivablesAgingSection } from "@/components/reports/ReceivablesAgingSection";
import { ReportTabSkeleton } from "@/components/skeletons/ReportTabSkeleton";
import { useReceivablesAging } from "@/hooks/use-reports";
import { parseISODateString, toISODateString } from "@/lib/date";
import { DEFAULT_REPORT_LIMIT } from "@/constants";

export default function ReceivablesAgingPage() {
  const [asOf, setAsOf] = useState(() => toISODateString(new Date()));
  const [limit, setLimit] = useState(DEFAULT_REPORT_LIMIT);

  const asOfValid = parseISODateString(asOf) !== undefined;
  const { data, isPending, error } = useReceivablesAging(asOfValid ? asOf : "", limit);

  return (
    <div className="page-container animate-fade-in">
      <ReportBackLink />
      <PageHeader
        title="Receivables aging"
        description="Open invoice lines by aging bucket"
        action={
          <ReportCsvButton
            reportPath="/reports/receivables-aging"
            query={{ asOf, limit }}
            filename="receivables-aging.csv"
            disabled={!asOfValid}
          />
        }
      />

      <ErrorBanner error={error} fallbackMessage="Failed to load receivables aging" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="as-of" className="text-muted-foreground">
            Report as of
          </Label>
          <Input
            id="as-of"
            type="date"
            className="w-full sm:w-44"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
          />
        </div>
        <ReportLimitInput value={limit} onChange={setLimit} />
      </div>

      {isPending ? (
        <ReportTabSkeleton height="h-96" />
      ) : data ? (
        <ReceivablesAgingSection data={data} />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">Enter a valid as-of date.</p>
      )}
    </div>
  );
}
