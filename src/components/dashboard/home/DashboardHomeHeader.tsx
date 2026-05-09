"use client";

import Link from "next/link";
import type { DashboardData } from "@/types/dashboard";
import { dashboardSnapshotCaption } from "@/lib/business/dashboard-home";
import type { DashboardCustomRangeFields } from "@/components/dashboard/DashboardCustomRangePopover";
import type { DashboardPeriodMode } from "@/types/dashboard";
import { DashboardHomePeriodFilter } from "@/components/dashboard/home/DashboardHomePeriodFilter";

interface DashboardHomeHeaderProps {
  dashboard: DashboardData;
  canCreateInvoice?: boolean;
  periodMode: DashboardPeriodMode;
  onPeriodModeChange: (mode: DashboardPeriodMode) => void;
  customRange: DashboardCustomRangeFields;
  onSeedCustomRangeIfEmpty?: () => void;
}

export function DashboardHomeHeader({
  dashboard,
  canCreateInvoice = true,
  periodMode,
  onPeriodModeChange,
  customRange,
  onSeedCustomRangeIfEmpty,
}: DashboardHomeHeaderProps) {
  const allowNewSaleInvoice = canCreateInvoice === true;
  const dateLabel = dashboardSnapshotCaption(dashboard);

  return (
    <section className="border-b border-border/40 pb-3 sm:pb-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Dashboard
            </h1>
            <span
              className="text-xs font-medium tabular-nums text-muted-foreground sm:text-sm"
              title="Figures for this snapshot"
            >
              {dateLabel}
            </span>
          </div>
          {!allowNewSaleInvoice ? (
            <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
              Finish your profile or renew access.{" "}
              <Link
                href="/profile"
                className="font-medium text-primary underline underline-offset-2"
              >
                Open profile
              </Link>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-stretch sm:items-end">
          <DashboardHomePeriodFilter
            periodMode={periodMode}
            onPeriodModeChange={onPeriodModeChange}
            customRange={customRange}
            onSeedCustomRangeIfEmpty={onSeedCustomRangeIfEmpty}
            align="end"
          />
        </div>
      </div>
    </section>
  );
}
