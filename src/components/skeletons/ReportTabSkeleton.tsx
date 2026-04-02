import { Skeleton } from "@/components/ui/skeleton";

export function ReportTabSkeleton({ height = "h-80" }: { height?: string }) {
  return <Skeleton className={`${height} w-full rounded-xl`} />;
}

/** Matches `ReportsDashboardSection`: period line, 3 KPI cards, 2 balance cards. */
export function ReportsDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-72 max-w-full" />
        <Skeleton className="h-3 w-full max-w-sm" />
      </div>
      <section className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl border" />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-32 rounded-xl border" />
          <Skeleton className="h-32 rounded-xl border" />
        </div>
      </section>
    </div>
  );
}
