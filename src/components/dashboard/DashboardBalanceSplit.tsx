import Link from "next/link";
import { ArrowRight, Receipt, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/core/utils";
import type { DashboardData, TopCustomer } from "@/types/dashboard";

function toNumber(v: string | number | undefined | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

interface DashboardBalanceSplitProps {
  dashboard: DashboardData;
  topCustomers: TopCustomer[];
}

export function DashboardBalanceSplit({ dashboard, topCustomers }: DashboardBalanceSplitProps) {
  const receivables = toNumber(dashboard.totalReceivables ?? 0);
  const paymentsRecorded = toNumber(dashboard.totalPaidFromLedger ?? dashboard.totalPaid);
  const customers = Array.isArray(topCustomers) ? topCustomers : [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-xl border border-border/80 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Receivables</CardTitle>
          <p className="text-xs text-muted-foreground">
            Running customer balances from your books. Due-date ageing is not shown on this
            dashboard yet — use reports for detail.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total receivables
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(receivables)}
            </p>
          </div>
          <div className="border-t border-border/70 pt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Top customers</p>
              <Button variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs" asChild>
                <Link href="/parties">
                  All parties
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            {customers.length > 0 ? (
              <ul className="space-y-2">
                {customers.slice(0, 6).map((c) => (
                  <li
                    key={c.partyId}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate text-sm font-medium">{c.partyName}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatCurrency(c.totalRevenue)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No customer revenue ranked yet — record sale invoices to populate this list.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/80 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Payments &amp; vendors</CardTitle>
          <p className="text-xs text-muted-foreground">
            Vendor payables are not summarized on this screen. Track purchase bills and vendor
            ledgers from the links below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Payments recorded
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(paymentsRecorded)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Receipts and similar credits recorded in the ledger (not the same as “paid on invoice”
              until allocated).
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row">
            <Button variant="outline" size="sm" className="justify-center" asChild>
              <Link href="/receipts">
                <Receipt className="mr-2 h-4 w-4" />
                Receipts
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="justify-center" asChild>
              <Link href="/invoices/purchases">Purchase bills</Link>
            </Button>
            <Button variant="outline" size="sm" className="justify-center" asChild>
              <Link href="/vendors">Vendors</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
