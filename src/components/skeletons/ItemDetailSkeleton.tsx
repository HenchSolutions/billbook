import { Skeleton } from "@/components/ui/skeleton";

/** Item detail: title block, stat cards grid, ledger card (back link stays real above). */
export default function ItemDetailSkeleton() {
  return (
    <div>
      <div className="page-header">
        <Skeleton className="h-9 w-2/3 max-w-md" />
      </div>
      <Skeleton className="mb-6 mt-2 h-4 w-full max-w-xl" />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg border" />
        ))}
      </div>

      <Skeleton className="h-[320px] rounded-xl border" />
    </div>
  );
}
