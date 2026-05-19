import { useCallback, useState } from "react";
import { usePagination } from "@/hooks/use-pagination";

interface InvoiceSearchFilters {
  search: string;
  partyId: number | undefined;
  startDate: string;
  endDate: string;
}

const EMPTY_SEARCH_FILTERS: InvoiceSearchFilters = {
  search: "",
  partyId: undefined,
  startDate: "",
  endDate: "",
};

interface UseInvoicesListFiltersOptions {
  defaultStatus?: string;
  defaultPageSize?: number;
}

export function useInvoicesListFilters(options: UseInvoicesListFiltersOptions = {}) {
  const { defaultStatus = "ALL", defaultPageSize = 20 } = options;

  const [statusFilter, setStatusFilter] = useState<string>(defaultStatus);
  const [draft, setDraft] = useState<InvoiceSearchFilters>(EMPTY_SEARCH_FILTERS);
  const [applied, setApplied] = useState<InvoiceSearchFilters>(EMPTY_SEARCH_FILTERS);
  const { page, setPage, resetPage } = usePagination();

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      resetPage();
    },
    [resetPage],
  );

  const setSearch = useCallback((search: string) => {
    setDraft((prev) => ({ ...prev, search }));
  }, []);

  const handleStartDateChange = useCallback((date: string) => {
    setDraft((prev) => ({ ...prev, startDate: date }));
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setDraft((prev) => ({ ...prev, endDate: date }));
  }, []);

  const handlePartyChange = useCallback((nextPartyId?: number) => {
    setDraft((prev) => ({ ...prev, partyId: nextPartyId }));
  }, []);

  const applySearchFilters = useCallback(() => {
    setApplied({ ...draft });
    resetPage();
  }, [draft, resetPage]);

  const clearSearchFilters = useCallback(() => {
    setDraft(EMPTY_SEARCH_FILTERS);
    setApplied(EMPTY_SEARCH_FILTERS);
    resetPage();
  }, [resetPage]);

  const hasDraftChanges =
    draft.search !== applied.search ||
    draft.partyId !== applied.partyId ||
    draft.startDate !== applied.startDate ||
    draft.endDate !== applied.endDate;

  const hasActiveSearchFilters =
    Boolean(applied.search.trim()) ||
    applied.partyId != null ||
    Boolean(applied.startDate) ||
    Boolean(applied.endDate);

  return {
    page,
    pageSize: defaultPageSize,
    setPage,
    statusFilter,
    search: draft.search,
    debouncedSearch: applied.search,
    setSearch,
    partyId: applied.partyId,
    draftPartyId: draft.partyId,
    startDate: draft.startDate,
    endDate: draft.endDate,
    appliedStartDate: applied.startDate,
    appliedEndDate: applied.endDate,
    handleStatusChange,
    handlePartyChange,
    handleStartDateChange,
    handleEndDateChange,
    applySearchFilters,
    clearSearchFilters,
    hasDraftChanges,
    hasActiveSearchFilters,
  };
}
