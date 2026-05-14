import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TriangleAlert, X } from "lucide-react";
import { useCreateParty, useUpdateParty } from "@/hooks/use-parties";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Party } from "@/types/party";
import {
  gstinString,
  optionalEmail,
  optionalString,
  unsignedPriceString,
} from "@/lib/core/validation-schemas";
import {
  hasPersistedOpeningBalance,
  openingBalanceFromApi,
  openingBalanceToApi,
} from "@/lib/party/party-opening-balance";
import { showErrorToast, showSuccessToast } from "@/lib/ui/toast-helpers";
import { capitaliseWords } from "@/lib/core/utils";
import { fetchPostalOffice } from "@/lib/india/pincode";
import { PartyConsigneesSection } from "@/components/parties/PartyConsigneesSection";
import { isValidGstin, isValidIndianPincode } from "@/lib/india/validators";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["CUSTOMER", "SUPPLIER"]).default("CUSTOMER"),
  gstin: gstinString,
  email: optionalEmail,
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  address: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: optionalString,
  openingBalanceAmount: unsignedPriceString,
  openingBalanceNature: z.enum(["DEBIT", "CREDIT"]),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party?: Party | null;
  initialName?: string;
  defaultType?: "CUSTOMER" | "SUPPLIER";
  presentation?: "dialog" | "inline";
  /** When true, type is fixed to defaultType and the Type field is hidden (e.g. when opening from Customer or Vendor page) */
  typeLocked?: boolean;
  /** Called with the created party after successful create (edit not used) */
  onSuccess?: (party: Party) => void;
}

export default function PartyDialog({
  open,
  onOpenChange,
  party,
  initialName,
  defaultType = "CUSTOMER",
  presentation = "dialog",
  typeLocked = false,
  onSuccess,
}: Props) {
  const isEdit = !!party;
  const isInline = presentation === "inline";
  const openingBalanceLocked =
    isEdit && party != null && hasPersistedOpeningBalance(party.openingBalance);
  const createMutation = useCreateParty();
  const updateMutation = useUpdateParty(party?.id ?? 0);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const instanceId = useId();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType, openingBalanceNature: "DEBIT" },
  });

  const partyType = watch("type");
  const isPartyActive = watch("isActive");
  const partyMeta =
    partyType === "SUPPLIER"
      ? { label: "vendor", title: "Vendor" }
      : { label: "customer", title: "Customer" };
  const partyLabel = partyMeta.label;
  const partyLabelTitle = partyMeta.title;
  const postalCode = watch("postalCode");
  const gstin = watch("gstin");
  const normalizedGstin = (gstin ?? "").trim();
  const gstinFormatInvalid = normalizedGstin.length > 0 && !isValidGstin(normalizedGstin);
  const normalizedPostalCode = (postalCode ?? "").trim().replace(/\D/g, "");
  const postalCodeFormatInvalid =
    normalizedPostalCode.length > 0 &&
    normalizedPostalCode.length === 6 &&
    !isValidIndianPincode(normalizedPostalCode);
  const pincodeInitialMountRef = useRef(true);

  // Fetch address from postal code (same API as business profile)
  useEffect(() => {
    const raw = (postalCode ?? "").toString().trim();
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 6) {
      pincodeInitialMountRef.current = false;
      return;
    }
    // Skip first run when dialog opens with existing 6-digit pincode (edit mode) so we don't overwrite
    if (pincodeInitialMountRef.current) {
      pincodeInitialMountRef.current = false;
      return;
    }

    const controller = new AbortController();
    const fetchAddress = async () => {
      try {
        const office = await fetchPostalOffice(digits, "IN", controller.signal);
        if (!office) return;
        if (office.name) setValue("address", office.name, { shouldDirty: true });
        if (office.district) setValue("city", office.district, { shouldDirty: true });
        if (office.state) setValue("state", office.state, { shouldDirty: true });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    };
    fetchAddress();
    return () => controller.abort();
  }, [postalCode, setValue]);

  useEffect(() => {
    if (open) {
      pincodeInitialMountRef.current = true;
      if (party) {
        const ob = openingBalanceFromApi(party.openingBalance);
        reset({
          name: party.name,
          type: typeLocked ? defaultType : party.type,
          gstin: party.gstin ?? "",
          email: party.email ?? "",
          phone: party.phone || "",
          address: party.address ?? "",
          city: party.city ?? "",
          state: party.state ?? "",
          postalCode: party.postalCode ?? "",
          openingBalanceAmount: ob.amount,
          openingBalanceNature: ob.nature,
          isActive: party.isActive ?? true,
        });
      } else {
        reset({
          name: initialName?.trim() ?? "",
          type: defaultType,
          gstin: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          openingBalanceAmount: "",
          openingBalanceNature: "DEBIT",
          isActive: true,
        });
      }
    }
  }, [open, party, reset, defaultType, typeLocked, initialName]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: capitaliseWords(data.name),
      type: typeLocked ? defaultType : data.type,
      gstin: data.gstin || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      postalCode: data.postalCode || undefined,
      isActive: data.isActive,
      ...(!openingBalanceLocked
        ? {
            openingBalance: openingBalanceToApi(
              data.openingBalanceAmount,
              data.openingBalanceNature,
            ),
          }
        : {}),
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        showSuccessToast(`${partyLabelTitle} updated`);
      } else {
        const created = await createMutation.mutateAsync(payload);
        showSuccessToast(`${partyLabelTitle} created`);
        onSuccess?.(created);
      }
      onOpenChange(false);
    } catch (err) {
      showErrorToast(
        err,
        isEdit ? `Failed to update ${partyLabel}` : `Failed to create ${partyLabel}`,
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isSaving = isSubmitting || isPending;
  const formTitle = isEdit ? `Edit ${partyLabelTitle}` : `New ${partyLabelTitle}`;
  const activeStatusId = `${instanceId}-status-active`;
  const inactiveStatusId = `${instanceId}-status-inactive`;
  const formSpacingClass = isInline ? "space-y-3" : "space-y-4";
  const fieldSpacingClass = isInline ? "space-y-2" : "space-y-2";
  const groupSpacingClass = isInline ? "space-y-3" : "space-y-4";
  const gridGapClass = isInline ? "gap-3" : "gap-4";

  const handleStatusChange = (value: string) => {
    if (value === "active") {
      setValue("isActive", true);
      return;
    }

    if (isEdit && party?.isActive && isPartyActive) {
      setDeactivateConfirmOpen(true);
      return;
    }

    setValue("isActive", false);
  };

  const handleConfirmDeactivate = () => {
    setValue("isActive", false);
    setDeactivateConfirmOpen(false);
  };

  if (isInline && !open) {
    return null;
  }

  const formContent = (
    <form
      onSubmit={(event) => {
        event.stopPropagation();
        void handleSubmit(onSubmit)(event);
      }}
      className={formSpacingClass}
    >
      <div className={groupSpacingClass}>
        <div
          className={
            isInline
              ? `grid grid-cols-1 ${gridGapClass} md:grid-cols-2 xl:grid-cols-4`
              : typeLocked
                ? groupSpacingClass
                : `grid grid-cols-1 ${gridGapClass} sm:grid-cols-2`
          }
        >
          <div className={fieldSpacingClass}>
            <Label required>Name</Label>
            <Input autoFocus={!isEdit} {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </div>
          <div className={fieldSpacingClass}>
            <Label required>Phone</Label>
            <Input
              aria-invalid={!!errors.phone}
              {...register("phone", {
                onChange: (e) => {
                  e.target.value = String(e.target.value ?? "")
                    .replace(/\D/g, "")
                    .slice(0, 10);
                },
              })}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="tel"
              maxLength={10}
            />
            {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
          </div>
          <div className={fieldSpacingClass}>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </div>
          {!typeLocked && (
            <div className={fieldSpacingClass}>
              <Label>Type</Label>
              <Select
                value={partyType}
                onValueChange={(v) => setValue("type", v as "CUSTOMER" | "SUPPLIER")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="SUPPLIER">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div
          className={
            isInline
              ? `grid grid-cols-1 ${gridGapClass} lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]`
              : groupSpacingClass
          }
        >
          <div className={groupSpacingClass}>
            <div className={fieldSpacingClass}>
              <Label>GSTIN</Label>
              <Input
                className="financial-id"
                placeholder="22AAAAA0000A1Z5"
                aria-invalid={!!errors.gstin || gstinFormatInvalid}
                {...register("gstin", {
                  onChange: (e) => {
                    e.target.value = String(e.target.value ?? "")
                      .toUpperCase()
                      .replace(/\s+/g, "")
                      .slice(0, 15);
                  },
                })}
              />
              {errors.gstin && <FieldError>{errors.gstin.message}</FieldError>}
              {!errors.gstin && gstinFormatInvalid ? (
                <FieldError>GSTIN must be 15 characters (e.g. 22AAAAA0000A1Z5).</FieldError>
              ) : null}
            </div>

            <div className={fieldSpacingClass}>
              <Label>Address</Label>
              <Input {...register("address")} placeholder="Area / locality" />
            </div>

            <div
              className={`grid grid-cols-1 ${gridGapClass} sm:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)]`}
            >
              <div className={fieldSpacingClass}>
                <Label>Postal Code</Label>
                <Input
                  {...register("postalCode")}
                  placeholder="560034"
                  maxLength={10}
                  inputMode="numeric"
                  aria-invalid={postalCodeFormatInvalid}
                />
                {postalCodeFormatInvalid ? (
                  <FieldError>Enter a valid 6-digit Indian pincode.</FieldError>
                ) : null}
              </div>
              <div className={fieldSpacingClass}>
                <Label>City</Label>
                <Input {...register("city")} />
              </div>
              <div className={fieldSpacingClass}>
                <Label>State</Label>
                <Input {...register("state")} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter 6-digit pincode to auto-fill address, city and state.
            </p>
          </div>

          <div className={fieldSpacingClass}>
            <Label>Opening balance</Label>
            <div
              className={
                isInline
                  ? `grid grid-cols-1 ${gridGapClass} sm:grid-cols-[minmax(0,1fr)_10.5rem]`
                  : "flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3"
              }
            >
              <div className="min-w-0 space-y-1.5">
                <Label
                  htmlFor="opening-balance-amount"
                  className="block text-xs text-muted-foreground"
                >
                  Amount
                </Label>
                <Input
                  id="opening-balance-amount"
                  placeholder="0.00"
                  inputMode="decimal"
                  autoComplete="off"
                  aria-invalid={!!errors.openingBalanceAmount}
                  disabled={openingBalanceLocked}
                  {...register("openingBalanceAmount")}
                />
                {errors.openingBalanceAmount && (
                  <FieldError>{errors.openingBalanceAmount.message}</FieldError>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="opening-balance-nature"
                  className="block text-xs text-muted-foreground"
                >
                  Type
                </Label>
                <Select
                  value={watch("openingBalanceNature")}
                  onValueChange={(v) =>
                    setValue("openingBalanceNature", v as "DEBIT" | "CREDIT", {
                      shouldDirty: true,
                    })
                  }
                  disabled={openingBalanceLocked}
                >
                  <SelectTrigger id="opening-balance-nature" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {openingBalanceLocked
                ? "Opening balance is fixed after the first save and cannot be changed here."
                : partyType === "SUPPLIER"
                  ? "Debit: advance paid to vendor · Credit: amount you owe the vendor"
                  : "Debit: customer owes you · Credit: customer paid in advance."}
            </p>
          </div>
        </div>
      </div>

      {isEdit && party?.id ? (
        <PartyConsigneesSection partyId={party.id} partyType={partyType} enabled={open} />
      ) : null}

      <div className={isInline ? "border-t pt-2.5" : "border-t pt-3"}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Label className="text-sm font-medium">Status</Label>
          <RadioGroup
            value={isPartyActive ? "active" : "inactive"}
            onValueChange={handleStatusChange}
            className="flex flex-wrap items-center gap-4"
            aria-label={`${partyLabelTitle} status`}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem id={activeStatusId} value="active" />
              <Label htmlFor={activeStatusId} className="cursor-pointer text-sm font-normal">
                Active
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id={inactiveStatusId} value="inactive" />
              <Label htmlFor={inactiveStatusId} className="cursor-pointer text-sm font-normal">
                Inactive
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving
            ? isEdit
              ? "Saving..."
              : `Creating ${partyLabelTitle}...`
            : isEdit
              ? "Save"
              : `Create ${partyLabelTitle}`}
        </Button>
      </div>
    </form>
  );

  const content = isInline ? (
    <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
      <CardHeader className="border-b bg-muted/10 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm sm:text-base">{formTitle}</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
            aria-label="Close form"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3 sm:p-5 sm:pt-4">{formContent}</CardContent>
    </Card>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {content}
      <AlertDialog
        open={deactivateConfirmOpen}
        onOpenChange={(open) => setDeactivateConfirmOpen(open)}
      >
        <AlertDialogContent className="max-w-md overflow-hidden p-0">
          <AlertDialogHeader className="border-b bg-destructive/5 px-5 py-4">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <TriangleAlert className="h-4 w-4" />
            </div>
            <AlertDialogTitle className="text-base">Deactivate this {partyLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the {partyLabel} as inactive and hide it by default in {partyLabel}{" "}
              lists and selections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t px-5 py-4">
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
