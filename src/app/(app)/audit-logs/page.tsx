"use client";

import { ClipboardList } from "lucide-react";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
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

  const { data, isPending, error, refetch, isRefetching } = useAuditLogs({
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

      <ErrorBanner
        error={error}
        fallbackMessage="Failed to load audit logs"
        onRetry={() => void refetch()}
        retrying={isRefetching}
      />

      {isPending ? (
        <TableSkeleton rows={5} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title={
            searchApplied.action === "ALL" ? "No audit logs yet" : "No matches for this filter"
          }
          description={
            searchApplied.action === "ALL"
              ? "Actions taken across your business will show up here."
              : "Try a different action, or clear the filter to see everything."
          }
          action={
            searchApplied.action === "ALL" ? undefined : (
              <button
                type="button"
                onClick={() => {
                  resetSearch();
                  resetPage();
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filter
              </button>
            )
          }
        />
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
