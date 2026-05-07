import * as React from "react";
import { cn } from "@/lib/core/utils";

type DataTableDensity = "compact" | "default" | "comfortable";

interface DataTableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: DataTableDensity;
}

const densityClassMap: Record<DataTableDensity, string> = {
  compact: "table-density-compact",
  default: "table-density-default",
  comfortable: "table-density-comfortable",
};

export function DataTableRoot({
  className,
  density = "default",
  children,
  ...props
}: DataTableRootProps) {
  return (
    <div className={cn("data-table-container", densityClassMap[density], className)} {...props}>
      {children}
    </div>
  );
}

export function DataTableTable({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("data-table min-w-[640px]", className)} {...props} />;
}

export function DataTableHead({
  className,
  sticky = true,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }) {
  return <thead className={cn(sticky && "data-table-head-sticky", className)} {...props} />;
}

export function DataTableHeaderCell({
  className,
  numeric = false,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      className={cn("data-table-th", numeric && "data-table-col-numeric", className)}
      scope="col"
      {...props}
    />
  );
}

export function DataTableCell({
  className,
  numeric = false,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={cn("data-table-td", numeric && "data-table-col-numeric", className)}
      {...props}
    />
  );
}

export function DataTableRow({
  className,
  selected = false,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }) {
  return (
    <tr
      className={cn("data-table-row", selected && "data-table-row-selected", className)}
      {...props}
    />
  );
}

export function DataTableBulkBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("data-table-bulk-bar", className)} {...props} />;
}
