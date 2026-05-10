import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
}

/** Placeholder for a list/table body while data loads. Mirrors the bordered card + header-row structure of real tables. */
export default function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-6 border-b border-border bg-muted/50 px-4 py-2.5">
        <Skeleton className="h-3 flex-[2]" />
        <Skeleton className="h-3 w-20 max-w-[6rem] flex-1" />
        <Skeleton className="h-3 w-16 max-w-[5rem] flex-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-3.5">
            <Skeleton className="h-4 flex-[2]" />
            <Skeleton className="h-4 w-20 max-w-[6rem] flex-1" />
            <Skeleton className="h-4 w-16 max-w-[5rem] flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
