import { AlertCircle, RotateCw } from "lucide-react";
import { cn } from "@/lib/core/utils";
import { getUserFacingErrorMessage } from "@/lib/ui/user-facing-error-message";

interface ErrorBannerProps {
  error: unknown;
  fallbackMessage?: string;
  className?: string;
  /** When provided, renders a "Try again" action (e.g. a query's `refetch`). */
  onRetry?: () => void;
  retrying?: boolean;
}

export default function ErrorBanner({
  error,
  fallbackMessage = "Something went wrong",
  className,
  onRetry,
  retrying = false,
}: ErrorBannerProps) {
  if (!error) return null;

  const message = getUserFacingErrorMessage(error, fallbackMessage);

  return (
    <div
      className={cn(
        "mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-line">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-destructive/30 bg-background px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCw className={cn("h-3.5 w-3.5", retrying && "animate-spin")} aria-hidden />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
