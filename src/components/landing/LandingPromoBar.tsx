import { Zap } from "lucide-react";

export function LandingPromoBar() {
  return (
    <div className="border-b border-border/60 bg-gradient-to-r from-primary/[0.08] via-accent/[0.06] to-primary/[0.05]">
      <div className="marketing-container flex items-center justify-center gap-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          <Zap className="h-3 w-3" />
          New
        </span>
        <span className="text-sm font-medium text-foreground">
          GST-ready billing, report CSVs, Tax / HTML export &amp; audit trails — one workspace.
        </span>
      </div>
    </div>
  );
}
