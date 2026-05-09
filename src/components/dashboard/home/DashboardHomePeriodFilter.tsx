"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/core/utils";
import { DashboardCustomRangePopover } from "@/components/dashboard/DashboardCustomRangePopover";
import type { DashboardCustomRangeFields } from "@/components/dashboard/DashboardCustomRangePopover";
import type { DashboardPeriodMode } from "@/types/dashboard";

interface DashboardHomePeriodFilterProps {
  periodMode: DashboardPeriodMode;
  onPeriodModeChange: (mode: DashboardPeriodMode) => void;
  customRange: DashboardCustomRangeFields;
  /** Prefill custom range when the calendar opens (e.g. 1 Apr → today) */
  onSeedCustomRangeIfEmpty?: () => void;
  /** Popover alignment when using custom range */
  align?: "start" | "end" | "center";
}

export function DashboardHomePeriodFilter({
  periodMode,
  onPeriodModeChange,
  customRange,
  onSeedCustomRangeIfEmpty,
  align = "end",
}: DashboardHomePeriodFilterProps) {
  const [rangePopoverOpen, setRangePopoverOpen] = useState(false);

  useEffect(() => {
    if (periodMode !== "custom") setRangePopoverOpen(false);
  }, [periodMode]);

  return (
    <div className="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-0.5">
      <button
        type="button"
        onClick={() => {
          setRangePopoverOpen(false);
          onPeriodModeChange("monthly");
        }}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          periodMode === "monthly"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        This month
      </button>
      <button
        type="button"
        onClick={() => {
          setRangePopoverOpen(false);
          onPeriodModeChange("overall");
        }}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          periodMode === "overall"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        All time
      </button>
      <DashboardCustomRangePopover
        open={rangePopoverOpen}
        onOpenChange={setRangePopoverOpen}
        customRange={customRange}
        isCustomPeriod={periodMode === "custom"}
        onActivateCustom={() => onPeriodModeChange("custom")}
        seedOnOpen={onSeedCustomRangeIfEmpty}
        align={align}
      />
    </div>
  );
}
