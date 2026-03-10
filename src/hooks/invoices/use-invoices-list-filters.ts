import { useCallback, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";

interface UseInvoicesListFiltersOptions {
  defaultStatus?: string;
  defaultPageSize?: number;
}

export function useInvoicesListFilters(options: UseInvoicesListFiltersOptions = {}) {
  const { defaultStatus = "ALL", defaultPageSize = 20 } = options;

  const [statusFilter, setStatusFilter] = useState<string>(defaultStatus);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { page, setPage, resetPage } = usePagination();
  const [partyId, setPartyId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      resetPage();
    },
    [resetPage],
  );

  const handleStartDateChange = useCallback(
    (date: string) => {
      setStartDate(date);
      resetPage();
    },
    [resetPage],
  );

  const handleEndDateChange = useCallback(
    (date: string) => {
      setEndDate(date);
      resetPage();
    },
    [resetPage],
  );

  const handlePartyChange = useCallback(
    (nextPartyId?: number) => {
      setPartyId(nextPartyId);
      resetPage();
    },
    [resetPage],
  );

  return {
    page,
    pageSize: defaultPageSize,
    setPage,
    statusFilter,
    search,
    debouncedSearch,
    setSearch,
    partyId,
    startDate,
    endDate,
    handleStatusChange,
    handlePartyChange,
    handleStartDateChange,
    handleEndDateChange,
  };
}
