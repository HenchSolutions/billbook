"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Landmark, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBusinessBankAccounts,
  useCreateBusinessBankAccount,
  useDeleteBusinessBankAccount,
  useUpdateBusinessBankAccount,
} from "@/hooks/use-bank-accounts";
import {
  isValidBankAccountNumberDigits,
  isValidIfsc,
  normalizeBankAccountDigits,
  normalizeIfsc,
} from "@/lib/business/bank-account-validation";
import { showErrorToast, showSuccessToast } from "@/lib/ui/toast-helpers";
import type { BusinessBankAccount } from "@/types/bank-account";
import { cn } from "@/lib/core/utils";

const bankAccountFormSchema = z.object({
  accountHolderName: z.string().trim().min(1, "Required"),
  bankAccountNumber: z
    .string()
    .min(1, "Required")
    .refine((s) => isValidBankAccountNumberDigits(normalizeBankAccountDigits(s)), {
      message: "6–34 digits only",
    }),
  bankName: z.string().trim().min(1, "Required"),
  branchName: z.string().trim().min(1, "Required"),
  ifscCode: z
    .string()
    .min(1, "Required")
    .refine((s) => isValidIfsc(normalizeIfsc(s)), {
      message: "11-character IFSC (e.g. SBIN0001234)",
    }),
  bankCity: z.string().trim().min(1, "Required"),
  bankState: z.string().trim().min(1, "Required"),
  isDefault: z.boolean().optional(),
});

type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>;

const emptyForm: BankAccountFormValues = {
  accountHolderName: "",
  bankAccountNumber: "",
  bankName: "",
  branchName: "",
  ifscCode: "",
  bankCity: "",
  bankState: "",
  isDefault: false,
};

function sortAccounts(accounts: BusinessBankAccount[]): BusinessBankAccount[] {
  return [...accounts].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    const oa = a.displayOrder ?? 0;
    const ob = b.displayOrder ?? 0;
    if (oa !== ob) return oa - ob;
    return a.id - b.id;
  });
}

export interface SavedBankAccountsSectionProps {
  canView: boolean;
  canEdit: boolean;
}

export function SavedBankAccountsSection({ canView, canEdit }: SavedBankAccountsSectionProps) {
  const { data, isPending, error } = useBusinessBankAccounts({ enabled: canView });
  const createMut = useCreateBusinessBankAccount();
  const updateMut = useUpdateBusinessBankAccount();
  const deleteMut = useDeleteBusinessBankAccount();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessBankAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessBankAccount | null>(null);

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: emptyForm,
  });

  const accounts = useMemo(() => sortAccounts(data?.bankAccounts ?? []), [data?.bankAccounts]);

  const openCreate = useCallback(() => {
    form.reset(emptyForm);
    setEditing(null);
    setDialogOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (acc: BusinessBankAccount) => {
      form.reset({
        accountHolderName: acc.accountHolderName,
        bankAccountNumber: acc.bankAccountNumber,
        bankName: acc.bankName,
        branchName: acc.branchName,
        ifscCode: acc.ifscCode,
        bankCity: acc.bankCity,
        bankState: acc.bankState,
        isDefault: Boolean(acc.isDefault),
      });
      setEditing(acc);
      setDialogOpen(true);
    },
    [form],
  );

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        setEditing(null);
        form.reset(emptyForm);
      }
    },
    [form],
  );

  const onSubmit = form.handleSubmit(async (vals) => {
    try {
      const payload = {
        accountHolderName: vals.accountHolderName.trim(),
        bankAccountNumber: normalizeBankAccountDigits(vals.bankAccountNumber),
        bankName: vals.bankName.trim(),
        branchName: vals.branchName.trim(),
        ifscCode: normalizeIfsc(vals.ifscCode),
        bankCity: vals.bankCity.trim(),
        bankState: vals.bankState.trim(),
        isDefault: vals.isDefault === true,
      };

      if (editing) {
        await updateMut.mutateAsync({ bankAccountId: editing.id, body: payload });
        showSuccessToast("Bank account updated");
      } else {
        await createMut.mutateAsync(payload);
        showSuccessToast("Bank account added");
      }
      handleDialogOpenChange(false);
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : null, "Couldn't save bank account");
    }
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      showSuccessToast("Bank account removed");
      setDeleteTarget(null);
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : null, "Couldn't delete bank account");
    }
  };

  const setDefault = async (acc: BusinessBankAccount) => {
    if (acc.isDefault) return;
    try {
      await updateMut.mutateAsync({ bankAccountId: acc.id, body: { isDefault: true } });
      showSuccessToast("Primary account updated");
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : null, "Couldn't set primary account");
    }
  };

  if (!canView) return null;

  return (
    <>
      <div className="space-y-3">
        {/* ── Sub-header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Saved accounts</p>
            <p className="text-xs text-muted-foreground">
              Select one as primary — it will be pre-filled on new invoices.
            </p>
          </div>
          {canEdit ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 shrink-0 gap-1.5 px-3 text-xs"
              onClick={openCreate}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add account
            </Button>
          ) : null}
        </div>

        {/* ── States ─────────────────────────────────────────────── */}
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Couldn't load bank accounts. Refresh or try again.
          </p>
        ) : isPending ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading bank accounts">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-muted/10 p-4">
                <Skeleton className="mb-2 h-4 w-48" />
                <Skeleton className="h-3 w-full max-w-xs" />
                <Skeleton className="mt-1.5 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-border/60 bg-muted/10 px-6 py-6 text-center">
            <Landmark className="h-6 w-6 text-muted-foreground/40" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {canEdit
                ? "No saved accounts yet — use the button above to add one."
                : "No saved accounts."}
            </p>
          </div>
        ) : (
          /* ── Account list ──────────────────────────────────────── */
          <div className="space-y-2" role="radiogroup" aria-label="Primary bank account">
            {accounts.map((acc) => {
              const isPrimary = Boolean(acc.isDefault);
              const bankLine = [acc.bankName, acc.branchName].filter(Boolean).join(" · ");
              const locationLine = [acc.bankCity, acc.bankState].filter(Boolean).join(", ");

              return (
                <div
                  key={acc.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                    isPrimary
                      ? "border-primary/40 bg-primary/[0.03]"
                      : "border-border/70 bg-background hover:border-border",
                    canEdit && !isPrimary && "cursor-pointer",
                  )}
                  role="radio"
                  aria-checked={isPrimary}
                  onClick={canEdit && !isPrimary ? () => void setDefault(acc) : undefined}
                >
                  {/* Radio indicator */}
                  <div className="mt-0.5 shrink-0" aria-hidden>
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                        isPrimary
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40 bg-background",
                      )}
                    >
                      {isPrimary ? <div className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                    </div>
                  </div>

                  {/* Account info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {acc.accountHolderName}
                          </p>
                          {isPrimary ? (
                            <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Primary
                            </span>
                          ) : null}
                        </div>
                        {bankLine ? (
                          <p className="text-xs text-muted-foreground">
                            {bankLine}
                            {locationLine ? (
                              <span className="text-muted-foreground/70"> · {locationLine}</span>
                            ) : null}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-4 pt-1 font-mono text-xs tabular-nums">
                          <span className="text-foreground">
                            {normalizeBankAccountDigits(acc.bankAccountNumber)}
                          </span>
                          <span className="text-muted-foreground">
                            {normalizeIfsc(acc.ifscCode)}
                          </span>
                        </div>
                      </div>

                      {/* Actions — stop click propagating to the radio wrapper */}
                      {canEdit ? (
                        <div
                          className="flex shrink-0 items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(acc)}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remove ${acc.accountHolderName}`}
                            onClick={() => setDeleteTarget(acc)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    {!isPrimary && canEdit ? (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Click to make primary
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add / Edit dialog ──────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="flex max-h-[min(90dvh,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          {/* sticky header */}
          <DialogHeader className="shrink-0 space-y-1 border-b border-border/80 px-6 py-4 text-left">
            <DialogTitle>{editing ? "Edit bank account" : "Add bank account"}</DialogTitle>
            <DialogDescription className="text-xs">
              {editing
                ? "Update the details below and save."
                : "Fill in your bank details. IFSC must be 11 characters; account number 6–34 digits."}
            </DialogDescription>
          </DialogHeader>

          {/* scrollable form body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <form
              id="bank-account-form"
              key={editing?.id ?? "new"}
              onSubmit={onSubmit}
              className="space-y-4 px-6 py-5"
            >
              {/* Holder + account number */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ba-holder" required>
                    Account holder name
                  </Label>
                  <Input
                    id="ba-holder"
                    {...form.register("accountHolderName")}
                    autoComplete="name"
                  />
                  {form.formState.errors.accountHolderName ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.accountHolderName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ba-number" required>
                    Account number
                  </Label>
                  <Input
                    id="ba-number"
                    inputMode="numeric"
                    className="financial-id w-full max-w-md"
                    {...form.register("bankAccountNumber")}
                    autoComplete="off"
                  />
                  {form.formState.errors.bankAccountNumber ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.bankAccountNumber.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ba-ifsc" required>
                    IFSC code
                  </Label>
                  <Input
                    id="ba-ifsc"
                    {...form.register("ifscCode")}
                    className="financial-id w-full max-w-[13rem] font-mono uppercase"
                    maxLength={11}
                    autoComplete="off"
                  />
                  {form.formState.errors.ifscCode ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.ifscCode.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <Separator />

              {/* Bank details grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ba-bank" required>
                    Bank name
                  </Label>
                  <Input id="ba-bank" {...form.register("bankName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ba-branch" required>
                    Branch
                  </Label>
                  <Input id="ba-branch" {...form.register("branchName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ba-city" required>
                    City
                  </Label>
                  <Input id="ba-city" {...form.register("bankCity")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ba-state" required>
                    State
                  </Label>
                  <Input id="ba-state" {...form.register("bankState")} />
                </div>
              </div>

              <Separator />

              {/* Primary toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={form.watch("isDefault") === true}
                onClick={() => form.setValue("isDefault", !form.watch("isDefault"))}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  form.watch("isDefault")
                    ? "border-primary/40 bg-primary/[0.04]"
                    : "border-border/70 bg-background hover:border-border",
                )}
              >
                <div className="mt-0.5 shrink-0" aria-hidden>
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                      form.watch("isDefault")
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {form.watch("isDefault") ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    ) : null}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Set as primary account</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Pre-filled on new invoices when no specific account is chosen.
                  </p>
                </div>
              </button>
            </form>
          </div>

          {/* sticky footer */}
          <DialogFooter className="shrink-0 gap-2 border-t border-border/80 bg-muted/20 px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="bank-account-form"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {editing ? "Save changes" : "Add account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ────────────────────────────────── */}
      <AlertDialog open={deleteTarget != null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this bank account?</AlertDialogTitle>
            <AlertDialogDescription>
              Invoices that reference it may show outdated payment details until updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
              onClick={() => void handleDelete()}
              disabled={deleteMut.isPending}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
