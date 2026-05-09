"use client";

import { useEffect, useState } from "react";
import { getResolvedHslFromVar } from "@/lib/ui/css-color-var";

/**
 * Resolves a CSS `hsl(var(--token))` at runtime and updates when `document.documentElement`
 * class/style changes (e.g. `.dark` toggle) so Recharts / canvas get real color strings.
 */
export function useResolvedCssHsl(varName: string): string {
  const [color, setColor] = useState(() =>
    typeof document !== "undefined" ? getResolvedHslFromVar(varName) : `hsl(var(${varName}))`,
  );

  useEffect(() => {
    const sync = () => setColor(getResolvedHslFromVar(varName));
    sync();
    const el = document.documentElement;
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    return () => mo.disconnect();
  }, [varName]);

  return color;
}
