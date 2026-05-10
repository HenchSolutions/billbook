import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors `DashboardPageClient`: `space-y-5 lg:space-y-6`, header + KPIs, chart, receivables/payables, stock, ledger. */
export default function DashboardSkeleton() {
  return (
    <div className="page-container animate-fade-in">
      <div className="space-y-5 lg:space-y-6">
        {/* Matches `DashboardHomeHeader` + `DashboardHomeKpis` wrapper spacing */}
        <div className="space-y-3 sm:space-y-4">
          <section className="border-b border-border/40 pb-3 sm:pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <Skeleton className="h-8 w-36 max-w-full sm:h-9" />
                  <Skeleton className="h-4 w-40 max-w-[min(100%,14rem)]" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-lg sm:h-10 sm:w-[min(100%,20rem)]" />
            </div>
          </section>

          <section>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-9 w-44 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="min-h-[120px] rounded-lg" />
              ))}
            </div>
          </section>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6 shadow-sm">
          <Skeleton className="mb-2 h-7 w-56" />
          <Skeleton className="mb-4 h-4 w-full max-w-xl" />
          <Skeleton className="h-[min(320px,55vw)] min-h-[260px] w-full rounded-lg bg-muted/50" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="min-h-[300px] rounded-lg border border-border/60 bg-card p-6 shadow-sm" />
          <Skeleton className="min-h-[300px] rounded-lg border border-border/60 bg-card p-6 shadow-sm" />
        </div>

        <section className="space-y-6">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="min-h-[120px] rounded-lg" />
            ))}
          </div>
        </section>

        <CardShellSkeleton />
      </div>
    </div>
  );
}

function CardShellSkeleton() {
  return (
    <section>
      <div className="rounded-lg border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/40 px-6 pb-3 pt-6">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </div>
        <div className="px-6 pb-6 pt-4">
          <Skeleton className="mb-5 h-10 w-full max-w-md rounded-lg" />
          <div className="rounded-lg border border-border/60 bg-muted/15">
            <Skeleton className="h-10 w-full rounded-none rounded-t-lg bg-muted/60" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none border-t border-border/50" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
