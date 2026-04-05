import { Skeleton } from "@/components/ui/skeleton";

/** Receipt detail: back link + large split card (matches `max-w-5xl` layout). */
export default function ReceiptDetailSkeleton() {
  return (
    <div className="page-container max-w-5xl animate-fade-in space-y-8 pb-10">
      <Skeleton className="mb-4 h-4 w-40" />

      <div className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
        <div className="grid lg:grid-cols-[1fr_minmax(280px,340px)]">
          <div className="flex flex-col gap-6 border-b border-border/60 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-3/4 max-w-sm" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="space-y-4 p-6 sm:p-8">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>

      <Skeleton className="h-48 rounded-xl border" />
    </div>
  );
}
