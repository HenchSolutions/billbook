import { Skeleton } from "@/components/ui/skeleton";

/** Party / vendor ledger: PageHeader with back, balance cards, tabs, table area. */
export default function PartyLedgerSkeleton() {
  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <Skeleton className="h-9 w-full max-w-lg" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-44 shrink-0 rounded-md" />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl border" />
        ))}
      </div>

      <Skeleton className="mb-4 h-10 w-full max-w-md rounded-lg" />

      <div className="rounded-xl border p-4">
        <div className="mb-3 flex gap-2 border-b pb-3">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="mb-2 h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
