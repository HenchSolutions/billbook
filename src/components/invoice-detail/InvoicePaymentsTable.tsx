"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/core/utils";
import { openSignedPdfFromApiPath } from "@/lib/ui/signed-pdf";
import {
  normalizeInvoicePaymentLine,
  type InvoicePaymentLine,
  type LegacyInvoicePayment,
} from "@/types/invoice";
import { InvoiceDetailSection } from "./InvoiceDetailSection";

const METHOD_STYLES: Record<string, string> = {
  CASH: "border-status-paid/30 bg-status-paid-bg text-status-paid",
  UPI: "border-primary/25 bg-primary/10 text-primary",
  CHEQUE: "border-status-pending/30 bg-status-pending-bg text-status-pending",
  BANK_TRANSFER: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  CARD: "border-border bg-secondary text-secondary-foreground",
};

function sourceLabel(line: InvoicePaymentLine): string {
  switch (line.source) {
    case "RECEIPT_ALLOCATION":
      return "Receipt";
    case "OUTBOUND_REFUND":
      return "Refund";
    default:
      return "Payment";
  }
}

function sourceBadgeClass(line: InvoicePaymentLine): string {
  switch (line.source) {
    case "RECEIPT_ALLOCATION":
      return "border-primary/25 bg-primary/[0.07] text-foreground";
    case "OUTBOUND_REFUND":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-foreground";
  }
}

interface InvoicePaymentsTableProps {
  payments: (LegacyInvoicePayment | InvoicePaymentLine)[];
}

export function InvoicePaymentsTable({ payments }: InvoicePaymentsTableProps) {
  const lines = payments.map((p) => normalizeInvoicePaymentLine(p));
  if (lines.length === 0) return null;

  const applied = lines
    .filter((p) => p.source !== "OUTBOUND_REFUND")
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const refunded = lines
    .filter((p) => p.source === "OUTBOUND_REFUND")
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <InvoiceDetailSection
      className="mb-5"
      title="Payments & receipts"
      action={
        lines.length > 1 ? (
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="font-medium tabular-nums text-status-paid">
              Applied {formatCurrency(applied)}
            </span>
            {refunded > 0 ? (
              <span className="font-medium tabular-nums text-destructive">
                Refunded {formatCurrency(refunded)}
              </span>
            ) : null}
          </div>
        ) : undefined
      }
      bodyClassName="px-0 py-0"
    >
      <ul className="divide-y divide-border/50">
        {lines.map((p) => (
          <li
            key={`${p.source}-${p.id}`}
            className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
              <Badge variant="outline" shape="tag" className={sourceBadgeClass(p)}>
                {sourceLabel(p)}
              </Badge>
              <span className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</span>
              <Badge variant="outline" shape="tag" className={METHOD_STYLES[p.paymentMethod] ?? ""}>
                {p.paymentMethod.replace("_", " ")}
              </Badge>
              {p.source === "RECEIPT_ALLOCATION" && p.receiptNumber ? (
                <Link
                  href={`/receipts/${p.receiptId}`}
                  className="financial-id text-sm text-primary hover:underline"
                >
                  {p.receiptNumber}
                </Link>
              ) : p.source === "OUTBOUND_REFUND" && p.outboundPaymentNumber ? (
                <span className="financial-id text-sm text-muted-foreground">
                  {p.outboundPaymentNumber}
                </span>
              ) : p.referenceNumber ? (
                <span className="text-sm text-muted-foreground">{p.referenceNumber}</span>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
              <span
                className={`text-sm font-semibold tabular-nums ${
                  p.source === "OUTBOUND_REFUND" ? "text-destructive" : "text-status-paid"
                }`}
              >
                {p.source === "OUTBOUND_REFUND" ? "−" : ""}
                {formatCurrency(p.amount)}
              </span>
              {p.source === "RECEIPT_ALLOCATION" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    void openSignedPdfFromApiPath(`/receipts/${p.receiptId}/pdf`, {
                      unavailable: "Receipt PDF not available.",
                      failed: "Failed to open receipt PDF",
                    })
                  }
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  PDF
                </Button>
              ) : null}
              {p.source === "OUTBOUND_REFUND" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    void openSignedPdfFromApiPath(`/payments/outbound/${p.id}/pdf`, {
                      unavailable: "Voucher PDF not available.",
                      failed: "Failed to open voucher PDF",
                    })
                  }
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  PDF
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </InvoiceDetailSection>
  );
}
