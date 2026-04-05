import { Download, Loader2, Pencil, CreditCard, Send, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { invoiceTypeSupportsReceiptPayment } from "@/lib/invoice";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceDetail } from "@/types/invoice";

const FINALIZE_INVENTORY_HELP =
  "Finalizing updates inventory: it can deduct stock (sales), add stock back (sale returns), create batches (purchase invoices), or remove quantity from batches (purchase returns), depending on this document. If the request fails, you can retry safely — an already finalized invoice returns success without duplicating stock effects.";

interface InvoiceHeaderActionsProps {
  invoice: InvoiceDetail;
  isOwner: boolean;
  balanceDueValue: number;
  balanceDue: string;
  sentToday: boolean;
  reminderToday: boolean;
  pdfUrl?: string | null;
  pdfError?: Error | null;
  isFinalizePending: boolean;
  isCancelPending: boolean;
  isMarkSentPending: boolean;
  isMarkReminderPending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onFinalize: () => void;
  onOpenPayment: () => void;
  onMarkSent: () => void;
  onMarkReminder: () => void;
}

export function InvoiceHeaderActions({
  invoice,
  isOwner,
  balanceDueValue,
  balanceDue,
  sentToday,
  reminderToday,
  pdfUrl,
  pdfError,
  isFinalizePending,
  isCancelPending,
  isMarkSentPending,
  isMarkReminderPending,
  onEdit,
  onCancel,
  onFinalize,
  onOpenPayment,
  onMarkSent,
  onMarkReminder,
}: InvoiceHeaderActionsProps) {
  const showRecordPayment = invoiceTypeSupportsReceiptPayment(invoice.invoiceType);

  return (
    <div className="flex gap-2">
      {invoice.status === "DRAFT" && isOwner && (
        <>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isCancelPending}>
            Cancel Invoice
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button size="sm" onClick={onFinalize} disabled={isFinalizePending}>
                  {isFinalizePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finalize
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm text-left text-xs leading-snug">
              {FINALIZE_INVENTORY_HELP}
            </TooltipContent>
          </Tooltip>
        </>
      )}

      {invoice.status === "FINAL" && showRecordPayment && (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPayment}
          disabled={balanceDueValue <= 0}
          className={balanceDueValue <= 0 ? "cursor-not-allowed opacity-50" : ""}
          title={
            balanceDueValue <= 0
              ? "Invoice is fully paid. No balance due to record."
              : `Record payment (Balance due: ${formatCurrency(balanceDue)})`
          }
        >
          <CreditCard className="mr-2 h-3.5 w-3.5" />
          Record Payment
        </Button>
      )}

      {invoice.status === "FINAL" && (
        <>
          <div className="flex flex-col">
            <Button variant="outline" size="sm" onClick={onMarkSent} disabled={isMarkSentPending}>
              {isMarkSentPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="mr-2 h-3.5 w-3.5" />
              )}
              Mark Sent
            </Button>
            {sentToday && (
              <span className="mt-1 text-[11px] text-muted-foreground">Sent today</span>
            )}
          </div>

          <div className="flex flex-col">
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkReminder}
              disabled={isMarkReminderPending}
            >
              {isMarkReminderPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bell className="mr-2 h-3.5 w-3.5" />
              )}
              Reminder
            </Button>
            {reminderToday && (
              <span className="mt-1 text-[11px] text-muted-foreground">Reminder today</span>
            )}
          </div>
        </>
      )}

      {pdfUrl && (
        <Button variant="outline" size="sm" asChild>
          <a href={pdfUrl} target="_blank" rel="noreferrer">
            <Download className="mr-2 h-3.5 w-3.5" />
            PDF
          </a>
        </Button>
      )}

      {!pdfUrl && pdfError && invoice.status === "FINAL" && (
        <Button variant="outline" size="sm" disabled title="PDF generation failed — try refreshing">
          <Download className="mr-2 h-3.5 w-3.5" />
          PDF unavailable
        </Button>
      )}
    </div>
  );
}
