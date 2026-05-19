import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageSearchActions, PageSearchCard } from "@/components/PageSearchSection";
import { AUDIT_ACTIONS } from "@/constants";

interface AuditLogFiltersProps {
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  clearDisabled?: boolean;
}

export function AuditLogFilters({
  actionFilter,
  onActionFilterChange,
  onApply,
  onClear,
  clearDisabled,
}: AuditLogFiltersProps) {
  return (
    <PageSearchCard>
      <div className="space-y-1 sm:max-w-xs">
        <Label className="text-xs font-medium text-muted-foreground">Action type</Label>
        <Select value={actionFilter || "ALL"} onValueChange={onActionFilterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All actions</SelectItem>
            {AUDIT_ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <PageSearchActions onSearch={onApply} onClear={onClear} clearDisabled={clearDisabled} />
    </PageSearchCard>
  );
}
