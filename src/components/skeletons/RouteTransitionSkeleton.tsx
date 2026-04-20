import { Skeleton } from "@/components/ui/skeleton";

/** Shown by `app/(app)/loading.tsx` during client navigations while the next page segment loads. */
export default function RouteTransitionSkeleton() {
  return (
    <div
      className="page-container w-full min-w-0 animate-fade-in pb-10 pt-1"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-[min(18rem,55vw)] sm:h-9" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-px w-full max-w-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl sm:h-36" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full max-w-4xl rounded-xl" />
          <Skeleton className="h-24 w-full max-w-4xl rounded-xl" />
        </div>
      </div>
    </div>
  );
}
