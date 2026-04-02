"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { clampReportLimit, DEFAULT_REPORT_LIMIT, MAX_REPORT_LIMIT } from "@/constants";

type ReportLimitInputProps = {
  id?: string;
  value: number;
  onChange: (n: number) => void;
};

export function ReportLimitInput({ id = "report-limit", value, onChange }: ReportLimitInputProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <Label htmlFor={id} className="whitespace-nowrap text-muted-foreground">
        Row limit
      </Label>
      <Input
        id={id}
        type="number"
        min={1}
        max={MAX_REPORT_LIMIT}
        className="w-full sm:w-28"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (Number.isNaN(n)) {
            onChange(DEFAULT_REPORT_LIMIT);
            return;
          }
          onChange(clampReportLimit(n));
        }}
      />
      <span className="text-xs text-muted-foreground">Max {MAX_REPORT_LIMIT.toLocaleString()}</span>
    </div>
  );
}
