"use client";

import ErrorBanner from "@/components/ErrorBanner";
import TablePagination from "@/components/TablePagination";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { AuditLogFilters, AuditLogsTable } from "@/components/audit-logs/AuditLogSections";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { usePagination } from "@/hooks/use-pagination";
import { useAppliedFilters } from "@/hooks/use-applied-filters";

export default function AuditLogs() {
  const { page, setPage, resetPage } = usePagination();
  const {
    draft: searchDraft,
    applied: searchApplied,
    apply: applySearch,
    reset: resetSearch,
    patchDraft,
  } = useAppliedFilters({ action: "ALL" });
  const pageSize = 20;

  const { data, isPending, error } = useAuditLogs({
    page,
    pageSize,
    action: searchApplied.action === "ALL" ? undefined : searchApplied.action,
  });

  const logs = data?.logs ?? [];
  const totalPages = Math.ceil((data?.count ?? 0) / pageSize) || 1;
  const total = data?.count ?? 0;

  return (
    <div className="page-container animate-fade-in">
      <PageHeader title="Audit logs" />

      <AuditLogFilters
        actionFilter={searchDraft.action}
        onActionFilterChange={(v) => patchDraft({ action: v })}
        onApply={() => {
          applySearch();
          resetPage();
        }}
        onClear={() => {
          resetSearch();
          resetPage();
        }}
        clearDisabled={searchApplied.action === "ALL"}
      />

      <ErrorBanner error={error} fallbackMessage="Failed to load audit logs" />

      {isPending ? (
        <TableSkeleton rows={5} />
      ) : logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No audit logs found.</p>
      ) : (
        <>
          <AuditLogsTable logs={logs} />

          <TablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
