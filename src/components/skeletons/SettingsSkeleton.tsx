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
              <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </div>
            </div>
            <div className="rounded-lg border border-border/60 shadow-sm ring-1 ring-black/5">
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
            <Skeleton className="h-40 rounded-lg border" />
          </section>
        </div>
      </div>
    );
  }

  if (variant === "profile") {
    /** Mirrors `ProfileEditor` + `BusinessProfileForm`: PageHeader row, completion card, stacked FormSections. */
    return (
      <div className="page-container animate-fade-in pb-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <Skeleton className="h-9 w-48 max-w-[85vw] sm:h-10" />
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>

        <div className="w-full space-y-6 sm:space-y-8">
          {/* ProfileCompletionCard */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/40">
            <div className="border-b border-border bg-muted/45 px-4 py-3 sm:px-5">
              <Skeleton className="h-5 w-56 max-w-full" />
            </div>
            <div className="space-y-3 bg-card px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-10 shrink-0" />
              </div>
              <Skeleton className="h-14 w-full rounded-lg border border-border/60 bg-muted/20" />
              <Skeleton className="min-h-[100px] rounded-lg border border-dashed border-border/60 bg-muted/10" />
            </div>
          </div>

          {(
            [
              "Business details",
              "Address",
              "Bank details",
              "Tax & compliance",
              "Miscellaneous",
            ] as const
          ).map((label, i) => (
            <section
              key={label}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/40"
            >
              <header className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/45 px-4 py-3 sm:px-5">
                <span className="h-6 w-1 shrink-0 rounded-full bg-primary/80" aria-hidden />
                <Skeleton className="h-5 w-36 sm:w-44" />
              </header>
              <div className="space-y-4 bg-card px-4 py-4 sm:px-5 sm:py-5">
                {i === 0 ? (
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <Skeleton className="mx-auto h-[136px] w-[152px] shrink-0 rounded-lg border border-border sm:mx-0" />
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                      <Skeleton className="h-10 w-full max-w-xl rounded-md" />
                    </div>
                  </div>
                ) : i === 2 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48 max-w-full" />
                      </div>
                      <Skeleton className="h-8 w-28 rounded-md" />
                    </div>
                    <Skeleton className="min-h-[88px] rounded-lg border border-dashed border-border/60 bg-muted/10" />
                  </div>
                ) : i === 4 ? (
                  <div className="mx-auto max-w-3xl space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2 sm:items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-10 w-full max-w-md rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="min-h-[120px] rounded-lg border border-border/60 bg-muted/15" />
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-border/60 pt-6">
                      <Skeleton className="h-4 w-28" />
                      {[1, 2].map((row) => (
                        <div
                          key={row}
                          className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto] sm:items-center"
                        >
                          <Skeleton className="h-10 w-full rounded-md" />
                          <Skeleton className="h-10 w-full rounded-md" />
                          <Skeleton className="h-9 w-9 justify-self-start rounded-md sm:justify-self-center" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-10 w-full rounded-md sm:col-span-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                )}
              </div>
            </section>
          ))}
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
      <Skeleton className="h-96 max-w-2xl rounded-lg" />
    </div>
  );
}
