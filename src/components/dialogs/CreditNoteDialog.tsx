import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateCreditNote, useCreditNotes } from "@/hooks/use-credit-notes";
import { useInvoices, useInvoice } from "@/hooks/use-invoices";
import { requiredPriceString, optionalString } from "@/lib/validation-schemas";
import { withInvoiceQuantityErrorDetails } from "@/lib/invoice-quantity-error-details";
import { showErrorToast, showSuccessToast } from "@/lib/toast-helpers";
import { maybeShowTrialExpiredToast } from "@/lib/trial";
const schema = z.object({
  invoiceId: z.coerce.number().min(1, "Select a sales return"),
  amount: requiredPriceString,
  reason: optionalString,
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultInvoiceId?: number;
}

export default function CreditNoteDialog({ open, onOpenChange, defaultInvoiceId }: Props) {
  const mutation = useCreateCreditNote();
  const lastPrefilledInvoiceId = useRef<number | null>(null);

  const { data: returnInvoicesData, isPending: returnInvoicesPending } = useInvoices({
    status: "FINAL",
    invoiceType: "SALE_RETURN",
    page: 1,
    pageSize: 200,
    enabled: open,
  });

  const { data: existingCreditNotesData, isPending: creditNotesListPending } = useCreditNotes({
    page: 1,
    pageSize: 500,
    enabled: open,
  });

  const invoiceIdsWithCreditNote = useMemo(() => {
    const s = new Set<number>();
    for (const cn of existingCreditNotesData?.creditNotes ?? []) {
      if (cn.deletedAt != null) continue;
      s.add(cn.invoiceId);
    }
    return s;
  }, [existingCreditNotesData?.creditNotes]);

  const invoices = useMemo(() => {
    const raw = returnInvoicesData?.invoices ?? [];
    return raw.filter((inv) => !invoiceIdsWithCreditNote.has(inv.id));
  }, [returnInvoicesData?.invoices, invoiceIdsWithCreditNote]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoiceId: defaultInvoiceId ?? 0,
      amount: "",
      reason: "",
    },
  });

  const watchedInvoiceId = watch("invoiceId");
  const { data: invoiceDetail, isPending: invoiceDetailPending } = useInvoice(
    watchedInvoiceId > 0 ? watchedInvoiceId : undefined,
  );

  useEffect(() => {
    if (!open) return;
    const defaultId = defaultInvoiceId ?? 0;
    const pick =
      defaultId > 0 && invoices.some((i) => i.id === defaultId)
        ? defaultId
        : (invoices[0]?.id ?? 0);
    reset({
      invoiceId: pick,
      amount: "",
      reason: "",
    });
    lastPrefilledInvoiceId.current = null;
  }, [open, defaultInvoiceId, reset, invoices]);

  const selectedInvoice = invoices.find((inv) => inv.id === watchedInvoiceId);
  const invoiceTotal = parseFloat(selectedInvoice?.totalAmount ?? "0") || 0;
  const invoicePaid = parseFloat(selectedInvoice?.paidAmount ?? "0") || 0;
  const invoiceDue = Math.max(0, invoiceTotal - invoicePaid);

  useEffect(() => {
    if (!open || watchedInvoiceId <= 0) return;
    if (!invoiceDetail || invoiceDetail.id !== watchedInvoiceId) return;
    if (invoiceDetail.invoiceType !== "SALE_RETURN") return;
    if (lastPrefilledInvoiceId.current === watchedInvoiceId) return;
    const t = invoiceDetail.totalAmount?.trim();
    if (t) {
      setValue("amount", t, { shouldDirty: false });
      lastPrefilledInvoiceId.current = watchedInvoiceId;
    }
  }, [open, watchedInvoiceId, invoiceDetail, setValue]);

  const onSubmit = async (data: FormData) => {
    const amt = parseFloat(data.amount) || 0;
    if (selectedInvoice && amt > invoiceTotal + 0.01) {
      showErrorToast(
        `Amount (${data.amount}) cannot exceed return total (${selectedInvoice.totalAmount}).`,
      );
      return;
    }

    try {
      await mutation.mutateAsync({
        invoiceId: data.invoiceId,
        amount: data.amount,
        reason: data.reason || undefined,
        affectsInventory: false,
      });
      showSuccessToast("Credit note created");
      onOpenChange(false);
    } catch (err) {
      if (maybeShowTrialExpiredToast(err)) return;
      showErrorToast(withInvoiceQuantityErrorDetails(err), "Failed to create credit note");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New credit note (sales return)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label required>Sales return</Label>
            <Select
              value={watch("invoiceId") > 0 ? String(watch("invoiceId")) : ""}
              onValueChange={(v) => {
                lastPrefilledInvoiceId.current = null;
                setValue("invoiceId", Number(v));
              }}
            >
              <SelectTrigger
                disabled={invoices.length === 0 || returnInvoicesPending || creditNotesListPending}
              >
                <SelectValue
                  placeholder={
                    returnInvoicesPending || creditNotesListPending
                      ? "Loading…"
                      : invoices.length === 0
                        ? "No eligible returns"
                        : "Select sales return"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {invoices.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No finalized sales returns without a credit note. Finalize a return, or finish
                    an existing credit note draft first.
                  </div>
                ) : (
                  invoices.map((inv) => (
                    <SelectItem key={inv.id} value={String(inv.id)}>
                      {inv.invoiceNumber} — {inv.partyName?.trim() || "Unknown party"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.invoiceId && <FieldError>{errors.invoiceId.message}</FieldError>}
          </div>

          <div className="space-y-2">
            <Label required>Amount</Label>
            <Input placeholder="0.00" {...register("amount")} aria-invalid={!!errors.amount} />
            {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
            {selectedInvoice && (
              <p className="text-xs text-muted-foreground">
                Return total: {selectedInvoice.totalAmount} — Balance due: {invoiceDue.toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea rows={2} {...register("reason")} />
          </div>

          {watchedInvoiceId > 0 && invoiceDetailPending ? (
            <p className="text-xs text-muted-foreground">Loading return details…</p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                mutation.isPending ||
                watch("invoiceId") <= 0 ||
                invoices.length === 0
              }
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Credit Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
