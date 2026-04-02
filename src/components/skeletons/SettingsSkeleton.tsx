import { Skeleton } from "@/components/ui/skeleton";

type SettingsSkeletonVariant = "settings" | "profile" | "compact";

interface SettingsSkeletonProps {
  /**
   * `settings` — Business settings (org card + personal block).
   * `profile` — My profile with header actions (wider form stack).
   * `compact` — Single tall panel (legacy fallback).
   */
  variant?: SettingsSkeletonVariant;
}

export default function SettingsSkeleton({ variant = "compact" }: SettingsSkeletonProps) {
  if (variant === "settings") {
    return (
      <div className="page-container animate-fade-in">
        <div className="page-header">
          <Skeleton className="h-9 w-64 max-w-[85vw]" />
          <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-1 h-4 w-full max-w-xl" />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </div>
            </div>
            <div className="rounded-2xl border border-border/80 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <div className="space-y-4 p-6 sm:p-8">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 max-w-xs" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-4 p-6 sm:p-8">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-40 rounded-xl border" />
          </section>
        </div>
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div className="page-container animate-fade-in pb-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-2 h-4 w-full max-w-md" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-36 w-full rounded-xl border" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl border" />
          <Skeleton className="h-48 rounded-xl border" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Skeleton className="h-96 max-w-2xl rounded-xl" />
    </div>
  );
}
