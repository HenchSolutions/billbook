import { History } from "lucide-react";
import {
  buildAuditHighlightParams,
  getAuditActivityTitle,
  getAuditChangeHighlights,
  resolveInvoiceAuditDisplayContext,
} from "@/lib/data/audit-log";
import { formatDate, formatTime } from "@/lib/core/utils";
import type { AuditLog } from "@/types/audit-log";
import { InvoiceDetailSection } from "./InvoiceDetailSection";

interface InvoiceAuditHistoryProps {
  logs: AuditLog[];
}

/** Collapse consecutive UPDATE events on the same day into one entry. */
function deduplicateLogs(logs: AuditLog[]): Array<AuditLog & { collapsedCount?: number }> {
  const result: Array<AuditLog & { collapsedCount?: number }> = [];

  for (const log of logs) {
    const last = result[result.length - 1];
    const sameDay =
      last &&
      last.action === "UPDATE" &&
      log.action === "UPDATE" &&
      last.resourceType === log.resourceType &&
      formatDate(last.createdAt) === formatDate(log.createdAt);

    if (sameDay) {
      last.collapsedCount = (last.collapsedCount ?? 1) + 1;
    } else {
      result.push({ ...log });
    }
  }

  return result;
}

export function InvoiceAuditHistory({ logs }: InvoiceAuditHistoryProps) {
  if (!logs.length) return null;

  const entries = deduplicateLogs(logs);

  return (
    <InvoiceDetailSection
      className="mb-5"
      title={
        <span className="inline-flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Activity
        </span>
      }
      bodyClassName="px-0 py-0"
    >
      <ol className="divide-y divide-border/50">
        {entries.map((log) => {
          const invoiceCtx = resolveInvoiceAuditDisplayContext(logs, log);
          const title = getAuditActivityTitle(log, invoiceCtx);
          const highlight = log.collapsedCount
            ? ""
            : getAuditChangeHighlights(log.changes, buildAuditHighlightParams(log, invoiceCtx));
          const date = formatDate(log.createdAt);
          const timeRaw = formatTime(log.createdAt);
          const time = timeRaw === "-" ? "" : timeRaw;

          return (
            <li key={log.id} className="px-5 py-3.5">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm leading-snug text-foreground">{title}</p>

                {log.collapsedCount && log.collapsedCount > 1 ? (
                  <p className="text-xs text-muted-foreground">
                    +{log.collapsedCount - 1} more edit
                    {log.collapsedCount - 1 !== 1 ? "s" : ""} on this day
                  </p>
                ) : null}

                {!log.collapsedCount && highlight ? (
                  <p className="whitespace-pre-line text-xs text-muted-foreground">{highlight}</p>
                ) : null}

                <p className="text-xs text-muted-foreground/70">
                  {date}
                  {time ? <span className="ml-1">{time}</span> : null}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </InvoiceDetailSection>
  );
}
