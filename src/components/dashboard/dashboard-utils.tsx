import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/core/utils";

type QuickStatVariant = "default" | "success" | "warning";

type QuickStatProps = {
  label: string;
  value: string | number;
  href?: string;
  variant?: QuickStatVariant;
  children?: ReactNode;
};

const QUICK_STAT_VARIANT_STYLES: Record<QuickStatVariant, string> = {
  default: "text-foreground",
  success: "text-status-paid",
  warning: "text-status-overdue",
};

export function QuickStat({ label, value, href, variant = "default", children }: QuickStatProps) {
  const content = (
    <Card className="group h-full rounded-xl border border-border/80 bg-card/90 shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-md dark:ring-white/[0.04]">
      <CardContent className="p-4 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "text-lg font-semibold tabular-nums tracking-tight sm:text-xl",
                QUICK_STAT_VARIANT_STYLES[variant],
              )}
            >
              {value}
            </p>
          </div>
          {children && (
            <div
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/30",
                QUICK_STAT_VARIANT_STYLES[variant],
              )}
            >
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}

export function DashboardSectionHeader({
  id,
  title,
  description,
  action,
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
