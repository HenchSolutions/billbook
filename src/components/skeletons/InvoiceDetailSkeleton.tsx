import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors invoice detail: PageBackLink, PageHeader + actions, InvoiceSummaryCards, InvoiceDetailsCards (2-col), Items table, Payments. */
export default function InvoiceDetailSkeleton() {
  return (
    <div className="page-container animate-fade-in">
      <Skeleton className="mb-4 h-4 w-36" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0 space-y-2">
          <Skeleton className="h-9 w-52 max-w-[90vw] sm:h-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* InvoiceSummaryCards */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Skeleton className="h-1.5 w-full rounded-none" />
        <div className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-44 max-w-[70vw]" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-2 sm:text-right">
              <Skeleton className="h-3 w-20 sm:ml-auto" />
              <Skeleton className="h-5 w-32 sm:ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* InvoiceDetailsCards — md:grid-cols-2 */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
        <div className="flex min-h-[220px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b px-6 pb-3 pt-4">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex flex-1 flex-col space-y-3 p-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="mt-auto h-20 rounded-md border border-border/60 bg-muted/15" />
          </div>
        </div>
        <div className="flex min-h-[220px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b px-6 pb-3 pt-4">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex flex-1 flex-col space-y-2 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* InvoiceLineItemsTable */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b px-6 pb-3 pt-4">
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="p-4 pt-2">
          <div className="mb-3 flex gap-4 border-b pb-3">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24 max-md:hidden" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))}
        </div>
      </div>

      {/* InvoicePaymentsTable */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b px-6 pb-3 pt-4">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="overflow-x-auto">
          <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-2.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="ml-auto h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-0"
            >
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="ml-auto h-4 w-24" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* InvoiceAuditHistory (optional block) */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b px-6 pb-3 pt-4">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="space-y-3 p-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
