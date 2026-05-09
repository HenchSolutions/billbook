import { memo, type ReactNode } from "react";
import { cn } from "@/lib/core/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  secondaryDescription?: string;
  action?: ReactNode;
}

const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  secondaryDescription,
  action,
}: EmptyStateProps) {
  const hasBodyCopy = Boolean(description ?? secondaryDescription);
  return (
    <div
      className={cn(
        "flex animate-fade-in flex-col items-center justify-center px-4 text-center",
        hasBodyCopy ? "py-12 sm:py-14" : "py-8 sm:py-10",
      )}
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15",
          hasBodyCopy ? "mb-3" : "mb-2.5",
        )}
      >
        <div className="text-primary">{icon}</div>
      </div>
      <h3
        className={cn("text-base font-semibold text-foreground", hasBodyCopy ? "mb-1.5" : "mb-1")}
      >
        {title}
      </h3>
      {description ? (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {secondaryDescription ? (
        <p className="-mt-2 mb-4 max-w-sm text-xs text-muted-foreground">{secondaryDescription}</p>
      ) : null}
      {action}
    </div>
  );
});

export default EmptyState;
