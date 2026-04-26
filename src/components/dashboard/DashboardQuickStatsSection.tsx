import Link from "next/link";
import { FileText, Package, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSectionHeader, QuickStat } from "./dashboard-utils";
import type { DashboardData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/core/utils";

interface DashboardQuickStatsSectionProps {
  dashboard: DashboardData;
}

export function DashboardQuickStatsSection({ dashboard }: DashboardQuickStatsSectionProps) {
  const advanceBalance = dashboard.totalAdvanceBalance ?? 0;

  return (
    <section className="rounded-2xl border border-border/80 bg-card/40 p-5 shadow-sm ring-1 ring-black/[0.03] dark:bg-card/30 dark:ring-white/[0.04] sm:p-6">
      <DashboardSectionHeader
        title="At a glance"
        description="Master data counts and sale-side activity. Receivables and top customers are in the balances panel on this page."
        action={
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link href="/reports">View reports</Link>
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <QuickStat label="Items" value={dashboard.totalItems} href="/items">
          <Package className="h-4 w-4" />
        </QuickStat>
        <QuickStat label="Parties" value={dashboard.totalParties} href="/parties">
          <Users className="h-4 w-4" />
        </QuickStat>
        <QuickStat label="Sale invoices" value={dashboard.totalInvoices} href="/invoices/sales">
          <FileText className="h-4 w-4" />
        </QuickStat>
        <QuickStat
          label="Advances (to parties)"
          value={formatCurrency(advanceBalance)}
          variant="success"
        >
          <TrendingUp className="h-4 w-4" />
        </QuickStat>
      </div>
    </section>
  );
}
