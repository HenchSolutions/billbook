import { cn } from "@/lib/core/utils";
import type { InvoiceRegisterPayStatus } from "@/lib/reports/invoice-register-filters";

export function RegisterInvoicePayStatusBadge({ status }: { status: InvoiceRegisterPayStatus }) {
  const cfg = {
    PAID: "bg-status-paid-bg text-status-paid border-status-paid/35 dark:border-status-paid/40",
    PARTIAL:
      "bg-status-pending-bg text-status-pending border-status-pending/35 dark:border-status-pending/40",
    UNPAID:
      "bg-destructive/10 text-destructive border-destructive/35 dark:bg-destructive/15 dark:border-destructive/40",
  }[status];
  const label = { PAID: "Paid", PARTIAL: "Partial", UNPAID: "Unpaid" }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cfg,
      )}
    >
      {label}
    </span>
  );
}
