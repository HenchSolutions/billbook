import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/core/utils";

export type TableSkeletonVariant = "default" | "items" | "stock" | "invoices" | "parties" | "form";

interface TableSkeletonProps {
  rows?: number;
  variant?: TableSkeletonVariant;
}

function HeaderCell({ className }: { className?: string }) {
  return <Skeleton className={cn("h-3 w-16", className)} />;
}

function ActionCells() {
  return (
    <div className="ml-auto flex shrink-0 justify-end gap-1">
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  );
}

/** Placeholder for list tables. Variants mirror DataTableRoot + current column layouts. */
export default function TableSkeleton({ rows = 5, variant = "default" }: TableSkeletonProps) {
  if (variant === "form") {
    return <FormRows rows={rows} />;
  }

  return (
    <div className="data-table-container overflow-hidden">
      <div className="min-w-0 overflow-x-auto">
        {variant === "items" ? (
          <ItemsRows rows={rows} />
        ) : variant === "stock" ? (
          <StockRows rows={rows} />
        ) : variant === "invoices" ? (
          <InvoiceRows rows={rows} />
        ) : variant === "parties" ? (
          <PartyRows rows={rows} />
        ) : (
          <DefaultRows rows={rows} />
        )}
      </div>
    </div>
  );
}

function DefaultRows({ rows }: { rows: number }) {
  return (
    <div className="min-w-[640px]">
      <div className="flex h-11 items-center gap-4 border-b border-border bg-muted/30 px-4">
        <HeaderCell className="w-28 flex-1" />
        <HeaderCell className="w-20" />
        <HeaderCell className="hidden w-24 md:block" />
        <HeaderCell className="w-20" />
        <HeaderCell className="ml-auto w-16" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-4 py-2.5 last:border-0"
        >
          <Skeleton className="h-4 min-w-0 flex-1" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="h-4 w-16" />
          <ActionCells />
        </div>
      ))}
    </div>
  );
}

function ItemsRows({ rows }: { rows: number }) {
  return (
    <div className="min-w-[760px]">
      <div className="flex h-11 items-center gap-4 border-b border-border bg-muted/30 px-4 sm:px-5">
        <HeaderCell className="w-40 flex-1" />
        <HeaderCell className="w-16" />
        <HeaderCell className="hidden w-20 md:block" />
        <HeaderCell className="hidden w-16 md:block" />
        <HeaderCell className="w-12" />
        <HeaderCell className="hidden w-16 md:block" />
        <HeaderCell className="hidden w-20 lg:block" />
        <HeaderCell className="ml-auto w-16" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-4 py-2.5 last:border-0 sm:px-5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <Skeleton className="h-20 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-28 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
          <Skeleton className="hidden h-4 w-20 shrink-0 md:block" />
          <Skeleton className="hidden h-5 w-16 shrink-0 rounded-md md:block" />
          <Skeleton className="h-4 w-10 shrink-0" />
          <Skeleton className="hidden h-4 w-16 shrink-0 md:block" />
          <Skeleton className="hidden h-4 w-16 shrink-0 lg:block" />
          <ActionCells />
        </div>
      ))}
    </div>
  );
}

function StockRows({ rows }: { rows: number }) {
  return (
    <>
      <div className="space-y-2 lg:hidden">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-3">
            <div className="flex gap-3">
              <Skeleton className="h-12 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-28 max-w-full" />
                <div className="flex gap-1">
                  <Skeleton className="h-4 w-10 rounded-md" />
                  <Skeleton className="h-4 w-10 rounded-md" />
                  <Skeleton className="h-4 w-10 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-8 w-10 shrink-0" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5">
              <Skeleton className="h-5 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden lg:block">
        <div className="flex h-11 items-center gap-3 border-b border-border bg-muted/50 px-4">
          <HeaderCell className="w-48 flex-1" />
          <HeaderCell className="hidden w-16 xl:block" />
          <HeaderCell className="hidden w-16 xl:block" />
          <HeaderCell className="w-14" />
          <HeaderCell className="w-20" />
          <HeaderCell className="ml-auto w-16" />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Skeleton className="h-12 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-28 max-w-full" />
              </div>
            </div>
            <Skeleton className="hidden h-5 w-16 shrink-0 rounded-full xl:block" />
            <Skeleton className="hidden h-4 w-16 shrink-0 xl:block" />
            <Skeleton className="h-4 w-12 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <div className="ml-auto flex shrink-0 justify-end gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function FormRows({ rows }: { rows: number }) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

function InvoiceRows({ rows }: { rows: number }) {
  return (
    <div className="min-w-[680px]">
      <div className="flex h-11 items-center gap-4 border-b border-border bg-muted/30 px-4">
        <HeaderCell className="w-28" />
        <HeaderCell className="min-w-0 flex-1" />
        <HeaderCell className="hidden w-20 sm:block" />
        <HeaderCell className="w-20" />
        <HeaderCell className="w-16" />
        <HeaderCell className="ml-auto w-16" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-4 py-2.5 last:border-0"
        >
          <Skeleton className="h-4 w-28 shrink-0" />
          <Skeleton className="h-4 min-w-0 flex-1" />
          <Skeleton className="hidden h-4 w-20 shrink-0 sm:block" />
          <Skeleton className="h-4 w-20 shrink-0" />
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
          <ActionCells />
        </div>
      ))}
    </div>
  );
}

function PartyRows({ rows }: { rows: number }) {
  return (
    <div className="min-w-[520px]">
      <div className="flex h-11 items-center gap-4 border-b border-border bg-muted/30 px-4 sm:px-6">
        <HeaderCell className="min-w-0 flex-1" />
        <HeaderCell className="w-24" />
        <HeaderCell className="hidden w-28 md:block" />
        <HeaderCell className="w-24" />
        <HeaderCell className="ml-auto w-16" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-4 py-2.5 last:border-0 sm:px-6"
        >
          <Skeleton className="h-4 min-w-0 flex-1" />
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="hidden h-4 w-28 shrink-0 md:block" />
          <Skeleton className="h-4 w-20 shrink-0" />
          <ActionCells />
        </div>
      ))}
    </div>
  );
}
