/**
 * Reads a `--token` from `:root` computed styles and returns a string usable as SVG/canvas fill.
 * Handles hsl components stored without `hsl()` wrapper (see `src/index.css` chart + theme vars).
 */
export function getResolvedHslFromVar(varName: string): string {
  if (typeof document === "undefined") {
    return `hsl(var(${varName}))`;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) {
    return `hsl(var(${varName}))`;
  }
  if (raw.startsWith("#") || raw.startsWith("hsl") || raw.startsWith("rgb")) {
    return raw;
  }
  return `hsl(${raw})`;
}
