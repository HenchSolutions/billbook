import type { ReactNode } from "react";
import { cn } from "@/lib/core/utils";

interface InvoiceDetailSectionProps {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function InvoiceDetailSection({
  title,
  action,
  children,
  className,
  bodyClassName,
}: InvoiceDetailSectionProps) {
  return (
    <section className={cn("rounded-xl border border-border/70 bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("px-5 py-4", bodyClassName)}>{children}</div>
    </section>
  );
}
