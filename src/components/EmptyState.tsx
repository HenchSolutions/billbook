import { memo, type ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
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
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {secondaryDescription ? (
        <p className="-mt-4 mb-6 max-w-sm text-xs text-muted-foreground">{secondaryDescription}</p>
      ) : null}
      {action}
    </div>
  );
});

export default EmptyState;
