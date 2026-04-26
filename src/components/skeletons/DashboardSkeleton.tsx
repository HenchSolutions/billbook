import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="page-container animate-fade-in">
      <div className="space-y-8 sm:space-y-10">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-40 sm:h-9" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-full rounded-md sm:w-72" />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-[min(320px,55vw)] min-h-[240px] w-full rounded-2xl" />

        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="min-h-[280px] rounded-xl" />
          <Skeleton className="min-h-[280px] rounded-xl" />
        </div>

        <section className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[88px] rounded-xl" />
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-border/80 p-5 sm:p-6">
          <Skeleton className="mb-4 h-5 w-48" />
          <Skeleton className="mb-4 h-9 w-full max-w-md rounded-lg" />
          <div className="overflow-hidden rounded-xl border border-border/70">
            <Skeleton className="h-10 w-full rounded-none" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-none border-t border-border/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
