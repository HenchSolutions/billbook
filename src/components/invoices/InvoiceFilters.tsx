import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import SearchInput from "@/components/SearchInput";
import DateRangePicker from "@/components/DateRangePicker";
import { PageSearchActions, PageSearchCard } from "@/components/PageSearchSection";
import { cn } from "@/lib/core/utils";
import type { Party } from "@/types/party";

interface InvoiceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  /** Defaults to "Search invoices..." */
  searchPlaceholder?: string;
  parties?: Party[];
  partyId?: number;
  onPartyChange?: (partyId?: number) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onClear: () => void;
  clearDisabled?: boolean;
}

function FilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label className="flex h-5 items-end text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function InvoiceFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search invoices...",
  parties = [],
  partyId,
  onPartyChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
  clearDisabled,
}: InvoiceFiltersProps) {
  return (
    <PageSearchCard>
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,11rem)_minmax(0,1.85fr)]">
        <FilterField label="Invoice search" className="sm:col-span-2 lg:col-span-1">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full max-w-none [&_input]:h-9"
          />
        </FilterField>

        <FilterField label="Party">
          <Select
            value={partyId != null ? String(partyId) : "ALL"}
            onValueChange={(v) => onPartyChange?.(v === "ALL" ? undefined : Number(v))}
            disabled={!onPartyChange}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="All parties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All parties</SelectItem>
              {parties.map((party) => (
                <SelectItem key={party.id} value={String(party.id)}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Date range" className="sm:col-span-2 lg:col-span-1">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            layout="inline"
            className="w-full"
          />
        </FilterField>
      </div>

      <PageSearchActions onSearch={onApply} onClear={onClear} clearDisabled={clearDisabled} />
    </PageSearchCard>
  );
}
