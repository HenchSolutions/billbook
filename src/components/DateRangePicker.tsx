import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import ErrorBanner from "./ErrorBanner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/core/utils";
import { parseISODateString, toISODateString, formatISODateDisplay } from "@/lib/core/date";

const DEFAULT_DISPLAY_LOCALE = "en-GB";
const DEFAULT_DISPLAY_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  error?: string | null;
  className?: string;
  autoFocusCalendar?: boolean;
  compact?: boolean;
  /** Single row: From [date] – To [date], labels beside inputs (for search cards). */
  layout?: "default" | "compact" | "inline";
  hint?: string;
  displayLocale?: string;
  displayDateOptions?: Intl.DateTimeFormatOptions;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error,
  className,
  autoFocusCalendar = true,
  compact = false,
  layout,
  hint,
  displayLocale = DEFAULT_DISPLAY_LOCALE,
  displayDateOptions = DEFAULT_DISPLAY_DATE_OPTIONS,
}: DateRangePickerProps) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const resolvedLayout = layout ?? (compact ? "compact" : "default");
  const isInline = resolvedLayout === "inline";
  const isCompact = resolvedLayout === "compact" || isInline;

  const stackedLabelCls = isCompact
    ? "mb-1 block text-sm font-medium text-muted-foreground"
    : "mb-1 block text-sm text-muted-foreground";
  const inlineLabelCls = "shrink-0 text-sm font-medium text-muted-foreground";

  const inlineBtnCls =
    "h-9 w-full min-w-0 flex-1 justify-start gap-1.5 bg-background px-2.5 text-left text-sm font-normal hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground";
  const compactBtnCls =
    "h-9 w-full justify-start gap-1.5 bg-background px-2.5 text-left text-sm font-normal hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground";
  const defaultBtnCls =
    "h-10 w-full justify-start gap-2 bg-background px-3 text-left font-normal hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground sm:w-[160px]";

  const btnCls = isInline ? inlineBtnCls : isCompact ? compactBtnCls : defaultBtnCls;
  const iconCls = isCompact
    ? "h-3.5 w-3.5 shrink-0 text-muted-foreground"
    : "h-4 w-4 text-muted-foreground";

  const renderDateButton = (
    value: string,
    placeholder: string,
    open: boolean,
    setOpen: (open: boolean) => void,
    onSelect: (iso: string) => void,
    defaultMonth: Date | undefined,
  ) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(btnCls, !value && "text-muted-foreground")}
        >
          <CalendarIcon className={iconCls} />
          <span className="truncate">
            {value ? formatISODateDisplay(value, displayLocale, displayDateOptions) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={parseISODateString(value)}
          defaultMonth={defaultMonth ?? new Date()}
          onSelect={(date) => {
            if (!date) return;
            onSelect(toISODateString(date));
            setOpen(false);
          }}
          {...(autoFocusCalendar ? { initialFocus: true } : { initialFocus: false })}
        />
      </PopoverContent>
    </Popover>
  );

  if (isInline) {
    return (
      <div className={cn("w-full min-w-0", className)}>
        <div className="flex h-auto w-full flex-col gap-2 sm:h-9 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className={inlineLabelCls}>From</span>
            <div className="flex min-w-0 flex-1">
              {renderDateButton(
                startDate,
                "dd/mm/yyyy",
                fromOpen,
                setFromOpen,
                onStartDateChange,
                parseISODateString(startDate) ?? undefined,
              )}
            </div>
          </div>
          <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline" aria-hidden>
            –
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className={inlineLabelCls}>To</span>
            <div className="flex min-w-0 flex-1">
              {renderDateButton(
                endDate,
                "dd/mm/yyyy",
                toOpen,
                setToOpen,
                onEndDateChange,
                parseISODateString(endDate) ?? parseISODateString(startDate) ?? undefined,
              )}
            </div>
          </div>
          {hint ? (
            <span className="hidden shrink-0 whitespace-nowrap text-[10px] leading-none text-muted-foreground xl:inline">
              {hint}
            </span>
          ) : null}
        </div>
        {error ? (
          <div className="mt-1.5">
            <ErrorBanner error={new Error(error)} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("w-full min-w-0", isCompact && "max-w-full", className)}>
      <div
        className={cn(
          isCompact
            ? "grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3"
            : "grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:items-end",
        )}
      >
        <div className={cn("min-w-0", isCompact ? "flex flex-col gap-1" : "w-full sm:w-auto")}>
          <Label className={stackedLabelCls}>From</Label>
          {renderDateButton(
            startDate,
            "dd/mm/yyyy",
            fromOpen,
            setFromOpen,
            onStartDateChange,
            parseISODateString(startDate) ?? undefined,
          )}
        </div>
        <div className={cn("min-w-0", isCompact ? "flex flex-col gap-1" : "w-full sm:w-auto")}>
          <Label className={stackedLabelCls}>To</Label>
          {renderDateButton(
            endDate,
            "dd/mm/yyyy",
            toOpen,
            setToOpen,
            onEndDateChange,
            parseISODateString(endDate) ?? parseISODateString(startDate) ?? undefined,
          )}
        </div>
      </div>
      {error ? (
        <div className={cn(isCompact ? "mt-2" : "mt-3")}>
          <ErrorBanner error={new Error(error)} />
        </div>
      ) : null}
    </div>
  );
}
