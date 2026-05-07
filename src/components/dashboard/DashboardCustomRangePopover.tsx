"use client";

import { Calendar } from "lucide-react";
import DateRangePicker from "@/components/DateRangePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/core/utils";
import { MAX_REPORT_DATE_RANGE_MONTHS } from "@/constants";

export interface DashboardCustomRangeFields {
  startDate: string;
  endDate: string;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  error: string | null;
}

interface DashboardCustomRangePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customRange: DashboardCustomRangeFields;
  /** Highlights trigger when custom period is active */
  isCustomPeriod: boolean;
  /** Called when the popover opens — typically switch dashboard to custom scope */
  onActivateCustom: () => void;
  align?: "start" | "center" | "end";
  /** Optional class on the icon trigger for layout (e.g. chart vs KPI toolbar) */
  triggerClassName?: string;
}

export function DashboardCustomRangePopover({
  open,
  onOpenChange,
  customRange,
  isCustomPeriod,
  onActivateCustom,
  align = "end",
  triggerClassName,
}: DashboardCustomRangePopoverProps) {
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) onActivateCustom();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Choose date range"
          aria-label="Open calendar to choose start and end dates"
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
            "hover:bg-muted/80 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isCustomPeriod ? "bg-card text-foreground shadow-sm ring-1 ring-border/70" : "",
            triggerClassName,
          )}
        >
          <Calendar className="h-4 w-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(calc(100vw-2rem),380px)] p-3 sm:w-auto" align={align}>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Period (max {MAX_REPORT_DATE_RANGE_MONTHS} months)
        </p>
        <DateRangePicker
          startDate={customRange.startDate}
          endDate={customRange.endDate}
          onStartDateChange={customRange.setStartDate}
          onEndDateChange={customRange.setEndDate}
          error={customRange.error}
          compact
          autoFocusCalendar={false}
        />
      </PopoverContent>
    </Popover>
  );
}
