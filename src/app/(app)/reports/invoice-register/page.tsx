"use client";

import { useState } from "react";
import Link from "next/link";
import DateRangePicker from "@/components/DateRangePicker";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ReportBackLink } from "@/components/reports/ReportBackLink";
import { ReportCsvButton } from "@/components/reports/ReportCsvButton";
import { ReportLimitInput } from "@/components/reports/ReportLimitInput";
import { ReportTabSkeleton } from "@/components/skeletons/ReportTabSkeleton";
import { useInvoiceRegister } from "@/hooks/use-reports";
import { useDateRange } from "@/hooks/use-date-range";
import { DEFAULT_REPORT_LIMIT, MAX_REPORT_DATE_RANGE_MONTHS } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoiceRegisterPage() {
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
  const [showConsignee, setShowConsignee] = useState(false);
  const { data, isPending, error } = useInvoiceRegister(validStartDate, validEndDate, limit);

  return (
    <div className="page-container animate-fade-in">
      <ReportBackLink />
      <PageHeader
        title="Invoice register"
        description="Invoices in the selected period"
        action={
          <ReportCsvButton
            reportPath="/reports/invoice-register"
            query={{ startDate: validStartDate, endDate: validEndDate, limit }}
            filename="invoice-register.csv"
            disabled={!validStartDate || !validEndDate}
          />
        }
      />

      <ErrorBanner error={error} fallbackMessage="Failed to load invoice register" />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          error={dateRangeError}
        />
        <div className="flex flex-wrap items-end gap-3">
          <ReportLimitInput value={limit} onChange={setLimit} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowConsignee((v) => !v)}
          >
            {showConsignee ? "Hide" : "Show"} ship-to / consignee
          </Button>
        </div>
      </div>

      {isPending ? (
        <ReportTabSkeleton height="h-80" />
      ) : data ? (
        <div className="data-table-container overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Invoice</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Party</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                {showConsignee && (
                  <>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Consignee
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">City</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(data.invoices ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={showConsignee ? 8 : 6}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    No invoices in this period.
                  </td>
                </tr>
              ) : (
                data.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-accent underline-offset-4 hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{inv.partyName ?? "—"}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{inv.invoiceType}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatDate(inv.invoiceDate)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    {showConsignee && (
                      <>
                        <td className="px-3 py-2 text-muted-foreground">
                          {inv.consigneeName ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {inv.consigneeCity ?? "—"}
                        </td>
                      </>
                    )}
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
