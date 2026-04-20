import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

let clientMql: MediaQueryList | null = null;

function getMql(): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  if (!clientMql) clientMql = window.matchMedia(MOBILE_MEDIA_QUERY);
  return clientMql;
}

function subscribe(onChange: () => void) {
  const mql = getMql();
  if (!mql) return () => {};
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getServerSnapshot() {
  return false;
}

/** Matches viewport to sidebar layout; uses sync external store to avoid a post-hydration layout flash. */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => getMql()?.matches ?? false, getServerSnapshot);
}
