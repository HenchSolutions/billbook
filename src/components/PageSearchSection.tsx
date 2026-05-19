import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/core/utils";

/** Dedicated search / filter card used on list pages (same pattern as report registers). */
export function PageSearchCard({
  children,
  className,
  title = "Search",
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-1.5 sm:px-4">
        <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <div className="px-3 py-2 sm:px-4">{children}</div>
    </div>
  );
}

export function PageSearchActions({
  onSearch,
  onClear,
  clearDisabled,
  searchDisabled,
  className,
  embedded = false,
}: {
  onSearch: () => void;
  onClear: () => void;
  clearDisabled?: boolean;
  searchDisabled?: boolean;
  className?: string;
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-end gap-2",
        embedded ? "w-full pb-0.5 sm:ml-auto sm:w-auto" : "mt-2.5 border-t border-border/60 pt-2.5",
        className,
      )}
    >
      <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={clearDisabled}>
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        Clear
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={onSearch}
        disabled={searchDisabled}
        className="min-w-[90px]"
      >
        <Search className="mr-1.5 h-3.5 w-3.5" />
        Search
      </Button>
    </div>
  );
}
