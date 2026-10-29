"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

/**
 * Thin top progress bar so slow screens never look frozen: shows from a link click until the new
 * route renders, and while any API request is in flight. Waits 120ms first so fast screens don't flicker.
 */
export default function TopLoadingBar() {
  const pathname = usePathname();
  const requestsInFlight = useIsFetching() + useIsMutating() > 0;
  const [navigating, setNavigating] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
        setNavigating(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // A navigation that never changes the path (blocked, error) must not leave the bar stuck.
  useEffect(() => {
    if (!navigating) return;
    const t = setTimeout(() => setNavigating(false), 15_000);
    return () => clearTimeout(t);
  }, [navigating]);

  const active = navigating || requestsInFlight;
  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, [active]);

  if (!show) return null;
  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-primary/15"
    >
      <div className="top-loading-bar h-full w-1/3 bg-primary" />
    </div>
  );
}
