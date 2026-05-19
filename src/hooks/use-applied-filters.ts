import { useCallback, useRef, useState } from "react";

/** Draft vs applied filter state — user edits draft, clicks Search to apply. */
export function useAppliedFilters<T>(initial: T) {
  const initialRef = useRef(initial);
  const [draft, setDraft] = useState<T>(initial);
  const [applied, setApplied] = useState<T>(initial);

  const apply = useCallback(() => {
    setApplied({ ...draft });
  }, [draft]);

  const reset = useCallback(() => {
    setDraft(initialRef.current);
    setApplied(initialRef.current);
  }, []);

  const patchDraft = useCallback((patch: Partial<T>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  return { draft, setDraft, applied, apply, reset, patchDraft };
}
