import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/core/utils";
import { getUserFacingErrorMessage } from "@/lib/ui/user-facing-error-message";

interface ErrorBannerProps {
  error: unknown;
  fallbackMessage?: string;
  className?: string;
}

export default function ErrorBanner({
  error,
  fallbackMessage = "Something went wrong",
  className,
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
        <div className="min-w-0">
          <p className="whitespace-pre-line">{message}</p>
        </div>
      </div>
    </div>
  );
}
