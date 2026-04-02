"use client";

import { useState } from "react";
import Link from "next/link";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import { ReportBackLink } from "@/components/reports/ReportBackLink";
import { ReportCsvButton } from "@/components/reports/ReportCsvButton";
import { ReportLimitInput } from "@/components/reports/ReportLimitInput";
import { ReportTabSkeleton } from "@/components/skeletons/ReportTabSkeleton";
import { usePayablesRegister } from "@/hooks/use-reports";
import { DEFAULT_REPORT_LIMIT } from "@/constants";
import { formatCurrency } from "@/lib/utils";

export default function PayablesRegisterPage() {
  const [limit, setLimit] = useState(DEFAULT_REPORT_LIMIT);
  const { data, isPending, error } = usePayablesRegister(limit);

  return (
    <div className="page-container animate-fade-in">
      <ReportBackLink />
      <PageHeader
        title="Payables register"
        description="Amounts you owe by party (ledger)"
        action={
          <ReportCsvButton
            reportPath="/reports/payables-register"
            query={{ limit }}
            filename="payables-register.csv"
          />
        }
      />

      <ErrorBanner error={error} fallbackMessage="Failed to load payables register" />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <ReportLimitInput value={limit} onChange={setLimit} />
      </div>

      {isPending ? (
        <ReportTabSkeleton height="h-80" />
      ) : data ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total payable </span>
            <span className="font-semibold text-rose-800 dark:text-rose-200">
              {formatCurrency(data.summary.totalPayable)}
            </span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-muted-foreground">{data.summary.creditorCount} creditors</span>
          </div>

          <div className="data-table-container overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Party</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">We owe</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Invoiced
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Paid</th>
                </tr>
              </thead>
              <tbody>
                {(data.parties ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No payable rows.
                    </td>
                  </tr>
                ) : (
                  data.parties.map((p) => (
                    <tr key={p.partyId} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <Link
                          href={`/parties/${p.partyId}/ledger`}
                          className="font-medium text-accent underline-offset-4 hover:underline"
                        >
                          {p.partyName}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{p.type}</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums text-rose-700 dark:text-rose-300">
                        {formatCurrency(p.payableAmount)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(p.totalInvoiced)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(p.totalPaid)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
