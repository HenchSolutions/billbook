import Link from "next/link";
import { Archive, AlertTriangle, PackageX, Zap, type LucideIcon } from "lucide-react";
import {
  fluidInventoryPulseValueClass,
  fluidMetricShellClass,
} from "@/components/dashboard/dashboard-utils";
import { cn, formatStockQuantity } from "@/lib/core/utils";
import type { DashboardData } from "@/types/dashboard";

type PulseKind = "low" | "out" | "dead" | "fast";

const SHELL: Record<PulseKind, string> = {
  low: "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-status-pending",
  out: "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-destructive",
  dead: "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]",
  fast: "border border-border/90 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05] border-t-[3px] border-t-status-paid",
};

const ICON_TILE: Record<PulseKind, string> = {
  low: "bg-chart-3 shadow-md ring-1 ring-chart-3/30",
  out: "bg-destructive shadow-md ring-1 ring-destructive/30",
  dead: "bg-muted-foreground shadow-md ring-1 ring-muted-foreground/25",
  fast: "bg-status-paid shadow-md ring-1 ring-status-paid/35",
};

const VALUE_CLASS: Record<PulseKind, string> = {
  low: "text-foreground",
  out: "text-destructive",
  dead: "text-foreground",
  fast: "text-status-paid",
};

const ICON: Record<PulseKind, LucideIcon> = {
  low: AlertTriangle,
  out: PackageX,
  dead: Archive,
  fast: Zap,
};

function StatCard({
  label,
  value,
  href,
  kind,
}: {
  label: string;
  value: string;
  href: string;
  kind: PulseKind;
}) {
  const Icon = ICON[kind];
  return (
    <Link
      href={href}
      className={cn(
        "group block min-h-[112px] rounded-lg border transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[120px]",
        "hover:shadow-md",
        SHELL[kind],
      )}
    >
      <div className={cn(fluidMetricShellClass, "flex h-full flex-col justify-center p-6")}>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ring-1 ring-black/[0.06]",
              ICON_TILE[kind],
            )}
            aria-hidden
          >
            <Icon className="h-[22px] w-[22px] text-white" strokeWidth={1.85} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-base font-medium leading-snug text-muted-foreground">{label}</p>
            <p
              className={cn(
                fluidInventoryPulseValueClass,
                "font-bold leading-none",
                VALUE_CLASS[kind],
              )}
            >
              {value}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface DashboardHomeStockPulseProps {
  dashboard: DashboardData;
}

export function DashboardHomeStockPulse({ dashboard }: DashboardHomeStockPulseProps) {
  const s = dashboard.stockPulse;
  const low = s?.lowStockCount ?? 0;
  const out = s?.outOfStockCount ?? 0;
  const dead = s?.deadStockCount ?? 0;
  const fast = s?.fastMovingCount ?? 0;

  return (
    <section className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Inventory pulse</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 [&>*]:min-w-0">
        <StatCard label="Low stock" value={formatStockQuantity(low)} href="/stock" kind="low" />
        <StatCard label="Out of stock" value={formatStockQuantity(out)} href="/stock" kind="out" />
        <StatCard label="Dead stock" value={formatStockQuantity(dead)} href="/items" kind="dead" />
        <StatCard label="Fast moving" value={formatStockQuantity(fast)} href="/items" kind="fast" />
      </div>
    </section>
  );
}
