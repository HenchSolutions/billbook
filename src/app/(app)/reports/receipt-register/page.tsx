"use client";

import { useState } from "react";
import Link from "next/link";
import DateRangePicker from "@/components/DateRangePicker";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import { ReportBackLink } from "@/components/reports/ReportBackLink";
import { ReportCsvButton } from "@/components/reports/ReportCsvButton";
import { ReportLimitInput } from "@/components/reports/ReportLimitInput";
import { ReportTabSkeleton } from "@/components/skeletons/ReportTabSkeleton";
import { useReceiptRegister } from "@/hooks/use-reports";
import { useDateRange } from "@/hooks/use-date-range";
import { DEFAULT_REPORT_LIMIT, MAX_REPORT_DATE_RANGE_MONTHS } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReceiptRegisterPage() {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    error: dateRangeError,
    validStartDate,
    validEndDate,
  } = useDateRange({ maxMonths: MAX_REPORT_DATE_RANGE_MONTHS });

  const [limit, setLimit] = useState(DEFAULT_REPORT_LIMIT);
  const { data, isPending, error } = useReceiptRegister(validStartDate, validEndDate, limit);

  return (
    <div className="page-container animate-fade-in">
      <ReportBackLink />
      <PageHeader
        title="Receipt register"
        description="Receipts in the selected period"
        action={
          <ReportCsvButton
            reportPath="/reports/receipt-register"
            query={{ startDate: validStartDate, endDate: validEndDate, limit }}
            filename="receipt-register.csv"
            disabled={!validStartDate || !validEndDate}
          />
        }
      />

      <ErrorBanner error={error} fallbackMessage="Failed to load receipt register" />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          error={dateRangeError}
        />
        <ReportLimitInput value={limit} onChange={setLimit} />
      </div>

      {isPending ? (
        <ReportTabSkeleton height="h-80" />
      ) : data ? (
        <div className="data-table-container overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Receipt</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Party</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Allocated
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  Unallocated
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Method</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Received</th>
              </tr>
            </thead>
            <tbody>
              {(data.receipts ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                    No receipts in this period.
                  </td>
                </tr>
              ) : (
                data.receipts.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <Link
                        href={`/receipts/${r.id}`}
                        className="font-medium text-accent underline-offset-4 hover:underline"
                      >
                        {r.receiptNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{r.partyName ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCurrency(r.totalAmount)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(r.allocatedAmount ?? "0")}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCurrency(r.unallocatedAmount)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{r.paymentMethod}</td>
                    <td className="px-3 py-2 text-muted-foreground">{formatDate(r.receivedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Select a valid date range to load data.
        </p>
      )}
    </div>
  );
}
