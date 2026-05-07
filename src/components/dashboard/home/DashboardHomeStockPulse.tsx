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
  low: "border-[hsl(38_45%_84%)] bg-[hsl(48_65%_96%)] shadow-sm ring-1 ring-amber-200/45 dark:border-amber-900/35 dark:bg-amber-950/20 dark:ring-amber-900/35",
  out: "border-[hsl(0_45%_86%)] bg-[hsl(0_75%_97%)] shadow-sm ring-1 ring-red-200/50 dark:border-red-900/40 dark:bg-red-950/25 dark:ring-red-900/40",
  dead: "border-[hsl(222_16%_88%)] bg-[hsl(222_25%_97%)] shadow-sm ring-1 ring-slate-200/50 dark:border-slate-800/40 dark:bg-slate-950/30 dark:ring-slate-800/40",
  fast: "border-[hsl(152_35%_85%)] bg-[hsl(152_48%_96%)] shadow-sm ring-1 ring-emerald-200/55 dark:border-emerald-900/35 dark:bg-emerald-950/25 dark:ring-emerald-900/35",
};

const ICON_TILE: Record<PulseKind, string> = {
  low: "bg-gradient-to-br from-amber-500 to-amber-600 shadow-md ring-1 ring-amber-400/30 dark:from-amber-600 dark:to-amber-700",
  out: "bg-gradient-to-br from-red-500 to-red-600 shadow-md ring-1 ring-red-400/25 dark:from-red-600 dark:to-red-700",
  dead: "bg-gradient-to-br from-slate-500 to-slate-700 shadow-md ring-1 ring-slate-400/30 dark:from-slate-600 dark:to-slate-800",
  fast: "bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md ring-1 ring-emerald-400/35 dark:from-emerald-600 dark:to-teal-700",
};

const VALUE_CLASS: Record<PulseKind, string> = {
  low: "text-amber-950 dark:text-amber-100",
  out: "text-red-800 dark:text-red-200",
  dead: "text-slate-900 dark:text-slate-100",
  fast: "text-emerald-900 dark:text-emerald-200",
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
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Quick counts for stock health. Open Stock or Items for full detail.
        </p>
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
