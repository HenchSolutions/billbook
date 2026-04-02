import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors `DashboardPageClient`: hero → quick stats → insights → highlights → recent activity. */
export default function DashboardSkeleton() {
  return (
    <div className="page-container animate-fade-in">
      <div className="space-y-10">
        {/* DashboardHeroSection */}
        <section className="rounded-3xl border bg-gradient-to-br from-muted/40 via-background to-muted/20 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-52 sm:h-9 sm:w-64" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-11 w-full rounded-full sm:w-48" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[100px] rounded-2xl sm:h-[108px]" />
            ))}
          </div>
        </section>

        {/* DashboardQuickStatsSection */}
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-3 w-full max-w-xl" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </section>

        {/* DashboardInsightsSection (advanced layout) */}
        <section className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[300px] rounded-3xl lg:col-span-2" />
            <Skeleton className="h-[300px] rounded-3xl" />
          </div>
          <Skeleton className="h-[200px] rounded-3xl" />
        </section>

        {/* DashboardHighlightsSection */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="min-h-[260px] rounded-3xl" />
          <Skeleton className="min-h-[260px] rounded-3xl" />
        </section>

        {/* DashboardRecentInvoicesSection */}
        <section className="space-y-4">
          <Skeleton className="h-[280px] rounded-3xl" />
        </section>
      </div>
    </div>
  );
}
