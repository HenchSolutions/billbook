import { getLineAmounts, toNum } from "@/lib/invoice/invoice-create";
import { moneyToPaise, paiseToMoney } from "@/lib/invoice/invoice-create-mapping";
import type { InvoiceLineDraft } from "@/types/invoice-create";

export type InvoiceCreateBillSummary = {
  subTotal: number;
  lineDiscountTotal: number;
  taxableTotal: number;
  invoiceDiscount: number;
  taxTotal: number;
  taxPercent: number;
  roundOff: number;
  grandTotal: number;
};

/** Totals for the invoice create sidebar (taxable, tax, discounts, round-off, payable). */
export function computeInvoiceCreateBillSummary(
  linesForBillSummary: InvoiceLineDraft[],
  discountAmount: string,
  discountPercent: string,
  roundOffAmount: string,
  autoRoundOff: boolean,
): InvoiceCreateBillSummary {
  const lineBreakup = linesForBillSummary.map((line) => getLineAmounts(line));
  const subTotal = lineBreakup.reduce((sum, x) => sum + x.gross, 0);
  const lineDiscountTotal = lineBreakup.reduce((sum, x) => sum + x.lineDiscount, 0);
  const linesTaxable = lineBreakup.reduce((sum, x) => sum + x.taxable, 0);
  const linesTax = lineBreakup.reduce((sum, x) => sum + x.tax, 0);

  // Same order as the server: item discounts, then the invoice discount, then GST on what is left
  // (the invoice discount is spread over the lines, so tax scales by the same ratio).
  const rawInvoiceDiscount =
    (linesTaxable * Math.min(100, Math.max(0, toNum(discountPercent)))) / 100 +
    Math.max(0, toNum(discountAmount));
  const invoiceDiscount = Math.min(linesTaxable, rawInvoiceDiscount);
  const taxableTotal = linesTaxable - invoiceDiscount;
  const taxTotal = linesTaxable > 0 ? (linesTax * taxableTotal) / linesTaxable : 0;

  const baseTotal = Math.max(0, taxableTotal + taxTotal);
  const basePaise = moneyToPaise(baseTotal);
  const roundPaise = autoRoundOff
    ? Math.round(basePaise / 100) * 100 - basePaise
    : -moneyToPaise(Math.max(0, toNum(roundOffAmount)));
  const roundOff = paiseToMoney(roundPaise);
  const grandTotal = Math.max(0, paiseToMoney(basePaise + roundPaise));

  return {
    subTotal,
    lineDiscountTotal,
    taxableTotal,
    invoiceDiscount,
    taxTotal,
    taxPercent: taxableTotal > 0 ? (taxTotal / taxableTotal) * 100 : 0,
    roundOff,
    grandTotal,
  };
}
