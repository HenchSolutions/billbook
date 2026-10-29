import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/core/utils";

/** Shared primary back control: always top-left, above the page title (see `PageHeader` `backHref` / `backLabel`). */
export const pageBackLinkClassName =
  "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function PageBackLink({
  href,
  children,
  className,
  onBeforeNavigate,
}: {
  href: string;
  children: ReactNode;
  /** Extra classes on the outer wrapper (default `mb-4`). */
  className?: string;
  /** Return `false` to block this click (e.g. unsaved changes) — caller then owns navigating on confirm. */
  onBeforeNavigate?: () => boolean;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <Link
        href={href}
        className={pageBackLinkClassName}
        onClick={(e) => {
          if (onBeforeNavigate && onBeforeNavigate() === false) {
            e.preventDefault();
          }
        }}
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        {children}
      </Link>
    </div>
  );
}
