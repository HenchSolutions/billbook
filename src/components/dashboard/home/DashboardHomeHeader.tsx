import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDateNumericINFromDate } from "@/lib/core/utils";
import type { DashboardData } from "@/types/dashboard";
import { snapshotLabelDate } from "@/lib/business/dashboard-home";

interface DashboardHomeHeaderProps {
  dashboard: DashboardData;
  greeting: string;
  canCreateInvoice?: boolean;
}

export function DashboardHomeHeader({
  dashboard,
  greeting,
  canCreateInvoice = true,
}: DashboardHomeHeaderProps) {
  const allowNewSaleInvoice = canCreateInvoice === true;
  const dateLabel = formatDateNumericINFromDate(snapshotLabelDate(dashboard));

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <p className="text-sm font-medium tabular-nums text-foreground">{dateLabel}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            {allowNewSaleInvoice ? (
              <Button asChild size="sm" className="rounded-md">
                <Link href="/invoices/new?type=SALE_INVOICE">+ New sales invoice</Link>
              </Button>
            ) : (
              <Button type="button" size="sm" className="rounded-md" disabled>
                + New sales invoice
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-md" asChild>
              <Link href="/invoices/purchases">Purchases</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-md" asChild>
              <Link href="/reports">Reports</Link>
            </Button>
          </div>
          {!allowNewSaleInvoice ? (
            <p className="max-w-[260px] text-right text-[11px] text-muted-foreground">
              Finish your profile or renew access.{" "}
              <Link
                href="/profile"
                className="font-medium text-primary underline underline-offset-2"
              >
                Profile
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
