import { useCallback, useState } from "react";

/** Shared page state with a stable reset action for filter/search changes. */
export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);

  const resetPage = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    setPage,
    resetPage,
  };
}
