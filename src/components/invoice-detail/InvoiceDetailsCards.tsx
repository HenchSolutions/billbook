"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { getInvoiceBillSummary, getInvoiceTypeCreateCopy } from "@/lib/invoice/invoice";
import { formatInvoicePartyAddressLines } from "@/lib/party/party-address-display";
import { cn, formatCurrency, formatDate, formatSignedCurrency, formatTime } from "@/lib/core/utils";
import type { InvoiceDetail } from "@/types/invoice";
import { useInvoice } from "@/hooks/use-invoices";
import { useBusinessBankAccounts } from "@/hooks/use-bank-accounts";
import { maskBankAccountNumber } from "@/lib/business/bank-account-validation";
import { InvoiceDetailSection } from "./InvoiceDetailSection";

interface InvoiceDetailsCardsProps {
  invoice: InvoiceDetail;
}

const EPS = 0.000_5;

function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 text-sm", className)}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <div className="min-w-0 text-right font-medium text-foreground">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 text-xs font-medium text-muted-foreground">{children}</p>;
}

export function InvoiceDetailsCards({ invoice }: InvoiceDetailsCardsProps) {
  const { data: bankAccountsPayload } = useBusinessBankAccounts({
    enabled: invoice.invoiceType === "SALE_INVOICE",
  });
  const summaryTitle = getInvoiceTypeCreateCopy(invoice.invoiceType).summaryTitle;
  const bill = getInvoiceBillSummary(invoice);
  const partyAddressText = formatInvoicePartyAddressLines(invoice);
  const addressLabel = invoice.addressRoleLabel || "Party address";

  const sourceId = invoice.sourceInvoiceId;
  const isReturnWithSource =
    (invoice.invoiceType === "SALE_RETURN" || invoice.invoiceType === "PURCHASE_RETURN") &&
    sourceId != null;
  const embeddedSourceNumber = invoice.sourceInvoiceNumber?.trim();
  const { data: sourceInvoice, isPending: sourceInvoicePending } = useInvoice(
    isReturnWithSource && !embeddedSourceNumber ? sourceId : undefined,
  );
  const sourceInvoiceNumber = embeddedSourceNumber || sourceInvoice?.invoiceNumber?.trim();

  const showLineDiscount = bill.lineDiscountTotal > EPS;
  const showInvoiceDiscount = bill.invoiceDiscount > EPS;
  const taxLabel =
    bill.taxableTotal > EPS || bill.taxTotal > EPS
      ? `Total tax (${bill.taxPercentEffective.toFixed(2)}%)`
      : "Total tax";
  const linkedBankAccount =
    invoice.businessBankAccountId != null
      ? (bankAccountsPayload?.bankAccounts?.find((a) => a.id === invoice.businessBankAccountId) ??
        null)
      : null;

  return (
    <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 md:items-start">
      <InvoiceDetailSection title="Notes & details" bodyClassName="flex flex-col gap-4 text-sm">
        {isReturnWithSource ? (
          <div>
            <FieldLabel>Linked document</FieldLabel>
            <Link
              href={`/invoices/${sourceId}`}
              className="text-sm font-medium text-primary hover:underline"
              title="Original invoice"
            >
              {sourceInvoiceNumber
                ? sourceInvoiceNumber
                : sourceInvoicePending
                  ? "Loading…"
                  : "Original invoice"}
            </Link>
          </div>
        ) : null}

        {invoice.invoiceType === "PURCHASE_INVOICE" &&
        invoice.sellingPriceMarginPercent != null &&
        String(invoice.sellingPriceMarginPercent).trim() !== "" ? (
          <div>
            <FieldLabel>Purchase pricing</FieldLabel>
            <DetailRow label="Selling margin (effective)">
              <span className="tabular-nums">
                {String(invoice.sellingPriceMarginPercent).trim()}%
              </span>
            </DetailRow>
          </div>
        ) : null}

        {invoice.invoiceType === "SALE_INVOICE" ? (
          <div>
            <FieldLabel>Bank on printed invoice</FieldLabel>
            {invoice.businessBankAccountId == null ? (
              <p className="text-sm text-muted-foreground">
                No bank account linked on this invoice
              </p>
            ) : linkedBankAccount ? (
              <div className="space-y-2">
                <DetailRow label="Bank">
                  <span className="truncate">
                    {linkedBankAccount.label?.trim()
                      ? `${linkedBankAccount.label.trim()} · ${linkedBankAccount.bankName}`
                      : linkedBankAccount.bankName}
                  </span>
                </DetailRow>
                <DetailRow label="Account no.">
                  <span className="font-mono text-sm">
                    {maskBankAccountNumber(linkedBankAccount.bankAccountNumber)}
                  </span>
                </DetailRow>
                <DetailRow label="IFSC">
                  <span className="font-mono text-sm">{linkedBankAccount.ifscCode}</span>
                </DetailRow>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selected account ID {invoice.businessBankAccountId}
              </p>
            )}
          </div>
        ) : null}

        {invoice.notes ? (
          <div>
            <FieldLabel>Notes</FieldLabel>
            <p className="text-sm leading-relaxed text-foreground">{invoice.notes}</p>
          </div>
        ) : null}

        {partyAddressText ? (
          <div>
            <FieldLabel>{addressLabel}</FieldLabel>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {partyAddressText}
            </p>
          </div>
        ) : null}

        <div className="space-y-2 border-t border-border/60 pt-4">
          <DetailRow label="Created">
            <span className="text-xs tabular-nums sm:text-sm">
              {formatDate(invoice.createdAt)} · {formatTime(invoice.createdAt)}
            </span>
          </DetailRow>
          <DetailRow label="Updated">
            <span className="text-xs tabular-nums sm:text-sm">
              {formatDate(invoice.updatedAt)} · {formatTime(invoice.updatedAt)}
            </span>
          </DetailRow>
        </div>
      </InvoiceDetailSection>

      <InvoiceDetailSection title={summaryTitle} bodyClassName="flex flex-col gap-2.5 text-sm">
        <DetailRow label="Gross amount">
          <span className="tabular-nums">{formatCurrency(bill.grossAmount)}</span>
        </DetailRow>
        {showLineDiscount ? (
          <DetailRow label="Item discount" className="text-muted-foreground">
            <span className="tabular-nums">−{formatCurrency(bill.lineDiscountTotal)}</span>
          </DetailRow>
        ) : null}
        {showInvoiceDiscount ? (
          <DetailRow label="Invoice discount" className="text-muted-foreground">
            <span className="tabular-nums">−{formatCurrency(bill.invoiceDiscount)}</span>
          </DetailRow>
        ) : null}
        <DetailRow label="Taxable amount" className="border-t border-border/60 pt-2.5">
          <span className="tabular-nums">{formatCurrency(bill.taxableTotal)}</span>
        </DetailRow>
        <DetailRow label={taxLabel}>
          <span className="tabular-nums">{formatCurrency(bill.taxTotal)}</span>
        </DetailRow>
        <DetailRow label="Subtotal (before round-off)">
          <span className="tabular-nums">{formatCurrency(bill.subtotalBeforeRoundOff)}</span>
        </DetailRow>
        <DetailRow label="Round off / discount" className="border-t border-border/60 pt-2.5">
          <span className="tabular-nums">{formatSignedCurrency(bill.roundOff)}</span>
        </DetailRow>
      </InvoiceDetailSection>
    </div>
  );
}
