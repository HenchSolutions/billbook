import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ReportBackLink() {
  return (
    <Link
      href="/reports"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      Back to reports
    </Link>
  );
}
