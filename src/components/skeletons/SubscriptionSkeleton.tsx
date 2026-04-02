import { Skeleton } from "@/components/ui/skeleton";

/** Matches static subscription placeholder (header + dashed panel). */
export default function SubscriptionSkeleton() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      </div>

      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="mt-6 h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-sm" />
        <Skeleton className="mt-2 h-4 max-w-xs" />
        <Skeleton className="mt-6 h-7 w-36 rounded-full" />
      </div>
    </div>
  );
}
